<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\SmartBin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Events\PointsUpdated;

class TransactionController extends Controller
{
    /**
     * Get user's transaction history
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);
        $type = $request->input('type'); // 'deposit' or 'redeem'

        $query = Transaction::where('user_id', $user->id)
            ->with(['smartBin:id,name,location'])
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('type', $type);
        }

        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions
        ], 200);
    }

    /**
     * Get point transaction history (detailed log)
     */
    public function pointHistory(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);

        $pointTransactions = PointTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $pointTransactions
        ], 200);
    }

    /**
     * Get transaction details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $transaction = Transaction::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['smartBin', 'pointTransaction'])
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction
        ], 200);
    }

    /**
     * Create deposit transaction (called by Smart Bin)
     */
    public function createDeposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'smart_bin_id' => 'required|exists:smart_bins,id',
            'bottles_count' => 'required|integer|min:1',
            'points_per_bottle' => 'sometimes|integer|min:1',
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

            $user = User::findOrFail($request->user_id);
            $smartBin = SmartBin::findOrFail($request->smart_bin_id);
            $pointsPerBottle = $request->input('points_per_bottle', 10); // Default 10 points per bottle
            $totalPoints = $request->bottles_count * $pointsPerBottle;

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'smart_bin_id' => $smartBin->id,
                'type' => 'deposit',
                'points' => $totalPoints,
                'bottles_count' => $request->bottles_count,
                'status' => 'completed',
                'notes' => "Deposited {$request->bottles_count} bottle(s) at {$smartBin->name}",
            ]);

            // Update user points
            $pointsBefore = $user->total_points;
            $user->total_points += $totalPoints;
            $user->save();

            // Create point transaction log
            PointTransaction::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'points_before' => $pointsBefore,
                'points_change' => $totalPoints,
                'points_after' => $user->total_points,
                'description' => "+{$totalPoints} Points: Deposited {$request->bottles_count} bottle(s) at {$smartBin->name}",
            ]);

            // Update smart bin stats
            $smartBin->total_bottles_collected += $request->bottles_count;
            $smartBin->save();

            // Dispatch real-time event
            event(new PointsUpdated($user, $totalPoints, 'deposit', "Deposited {$request->bottles_count} bottle(s)"));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Deposit successful',
                'data' => [
                    'transaction' => $transaction,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'total_points' => $user->total_points,
                        'points_earned' => $totalPoints,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create deposit transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's total points
     */
    public function getTotalPoints(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'total_points' => $user->total_points,
                'user_id' => $user->id,
                'name' => $user->name,
            ]
        ], 200);
    }
}
