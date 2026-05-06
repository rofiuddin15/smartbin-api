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

            // If rejected, refund points to user?
            // Usually, if it fails, we should refund points unless it's a specific fraud case.
            if ($request->status === 'failed') {
                $user = $transaction->user;
                $pointsToRefund = abs($transaction->points);
                
                $pointsBefore = $user->total_points;
                $user->total_points += $pointsToRefund;
                $user->save();

                // Log refund
                \App\Models\PointTransaction::create([
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'points_before' => $pointsBefore,
                    'points_change' => $pointsToRefund,
                    'points_after' => $user->total_points,
                    'description' => "Refund: Redemption #{$transaction->id} failed/rejected.",
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
}
