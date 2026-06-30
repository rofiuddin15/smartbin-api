<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RedeemManagementController extends Controller
{
    /**
     * List all redemption requests
     */
    public function index(Request $request)
    {
        $query = Transaction::where('type', 'redeem')
            ->whereHas('user', function($q) {
                $q->whereDoesntHave('roles', function($rq) {
                    $rq->whereIn('name', ['admin', 'operator', 'finance']);
                });
            })
            ->with('user:id,name,email,phone_number');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by e-wallet type
        if ($request->has('ewallet_type') && $request->ewallet_type !== 'all') {
            $query->where('ewallet_type', $request->ewallet_type);
        }

        // Search by member name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $transactions = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Get redemption stats
     */
    public function stats()
    {
        $pendingCount = Transaction::where('type', 'redeem')->where('status', 'pending')->count();
        $pendingAmount = Transaction::where('type', 'redeem')->where('status', 'pending')->sum('ewallet_amount');
        $completedToday = Transaction::where('type', 'redeem')
            ->where('status', 'completed')
            ->whereDate('updated_at', today())
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'pending_count' => $pendingCount,
                'pending_amount' => (float)$pendingAmount,
                'completed_today' => $completedToday,
            ]
        ]);
    }

    /**
     * Update redemption status (Approve/Reject)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:completed,failed',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = Transaction::where('type', 'redeem')->findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending requests can be updated.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $transaction->status = $request->status;
            if ($request->has('notes')) {
                $transaction->notes = $request->notes;
            }
            $transaction->save();

            // Deduct points when approved
            if ($request->status === 'completed') {
                $user = $transaction->user;
                $pointsToDeduct = abs($transaction->points);
                
                $pointsBefore = $user->total_points;
                $user->total_points -= $pointsToDeduct;
                $user->save();

                // Log deduction
                \App\Models\PointTransaction::create([
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'points_before' => $pointsBefore,
                    'points_change' => -$pointsToDeduct,
                    'points_after' => $user->total_points,
                    'description' => "Redeem: -{$pointsToDeduct} pts to {$transaction->ewallet_type}",
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Redemption request marked as {$request->status}",
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update redemption status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
            'status' => 'required|in:completed,failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $transactions = Transaction::whereIn('id', $request->ids)
                ->where('type', 'redeem')
                ->where('status', 'pending')
                ->get();

            $processedCount = 0;

            foreach ($transactions as $transaction) {
                $transaction->status = $request->status;
                $transaction->save();

                if ($request->status === 'completed') {
                    $user = $transaction->user;
                    $pointsToDeduct = abs($transaction->points);
                    
                    $pointsBefore = $user->total_points;
                    $user->total_points -= $pointsToDeduct;
                    $user->save();

                    \App\Models\PointTransaction::create([
                        'user_id' => $user->id,
                        'transaction_id' => $transaction->id,
                        'points_before' => $pointsBefore,
                        'points_change' => -$pointsToDeduct,
                        'points_after' => $user->total_points,
                        'description' => "Redeem: -{$pointsToDeduct} pts to {$transaction->ewallet_type} (Bulk)",
                    ]);
                }
                $processedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully processed {$processedCount} requests.",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
