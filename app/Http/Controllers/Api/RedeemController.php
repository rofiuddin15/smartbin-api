<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Events\PointsUpdated;

class RedeemController extends Controller
{
    // Points to Rupiah conversion rate (e.g., 100 points = Rp 1000)
    private $conversionRate = 10; // 1 point = Rp 10
    private $minimumPoints = 100; // Minimum points to redeem

    /**
     * Get available e-wallet options
     */
    public function getEwalletOptions()
    {
        $options = [
            [
                'type' => 'gopay',
                'name' => 'GoPay',
                'icon' => 'gopay.png',
                'minimum_points' => $this->minimumPoints,
            ],
            [
                'type' => 'ovo',
                'name' => 'OVO',
                'icon' => 'ovo.png',
                'minimum_points' => $this->minimumPoints,
            ],
            [
                'type' => 'dana',
                'name' => 'DANA',
                'icon' => 'dana.png',
                'minimum_points' => $this->minimumPoints,
            ],
            [
                'type' => 'shopeepay',
                'name' => 'ShopeePay',
                'icon' => 'shopeepay.png',
                'minimum_points' => $this->minimumPoints,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'options' => $options,
                'conversion_rate' => $this->conversionRate,
                'minimum_points' => $this->minimumPoints,
                'note' => "1 point = Rp {$this->conversionRate}"
            ]
        ], 200);
    }

    /**
     * Calculate redeem amount
     */
    public function calculateRedeem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:' . $this->minimumPoints,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $points = $request->points;

        if ($points > $user->total_points) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient points'
            ], 400);
        }

        $amount = $points * $this->conversionRate;

        return response()->json([
            'success' => true,
            'data' => [
                'points' => $points,
                'amount' => $amount,
                'conversion_rate' => $this->conversionRate,
                'formatted_amount' => 'Rp ' . number_format($amount, 0, ',', '.'),
            ]
        ], 200);
    }

    /**
     * Process redeem request
     */
    public function redeem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:' . $this->minimumPoints,
            'ewallet_type' => 'required|in:gopay,ovo,dana,shopeepay',
            'ewallet_account' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $points = $request->points;

        if ($points > $user->total_points) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient points. You have ' . $user->total_points . ' points.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $amount = $points * $this->conversionRate;

            // Create redeem transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'smart_bin_id' => null,
                'type' => 'redeem',
                'points' => -$points, // Negative for redemption
                'ewallet_type' => $request->ewallet_type,
                'ewallet_account' => $request->ewallet_account,
                'ewallet_amount' => $amount,
                'status' => 'pending',
                'notes' => "Redeem {$points} points to {$request->ewallet_type}",
            ]);

            // Update user points
            $pointsBefore = $user->total_points;
            $user->total_points -= $points;
            $user->save();

            // Create point transaction log
            PointTransaction::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'points_before' => $pointsBefore,
                'points_change' => -$points,
                'points_after' => $user->total_points,
                'description' => "-{$points} Points: Redeem to {$request->ewallet_type} ({$request->ewallet_account})",
            ]);

            // In production: Call payment gateway API here
            // For now, simulate success
            $paymentSuccess = $this->processPayment($request->ewallet_type, $request->ewallet_account, $amount);

            if ($paymentSuccess) {
                $transaction->status = 'completed';
                $transaction->save();

                // Dispatch real-time event
                event(new PointsUpdated($user, -$points, 'redeem', "Redeemed to {$request->ewallet_type}"));

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Redeem successful. Payment will be processed shortly.',
                    'data' => [
                        'transaction' => $transaction,
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'total_points' => $user->total_points,
                        ]
                    ]
                ], 201);
            } else {
                // Rollback if payment fails
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Payment processing failed. Please try again.'
                ], 500);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process redeem request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get redeem history
     */
    public function redeemHistory(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);

        $redeems = Transaction::where('user_id', $user->id)
            ->where('type', 'redeem')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $redeems
        ], 200);
    }

    /**
     * Get redeem packages/suggestions
     */
    public function getRedeemPackages(Request $request)
    {
        $user = $request->user();

        $packages = [
            [
                'id' => 1,
                'points' => 100,
                'amount' => 1000,
                'formatted_amount' => 'Rp 1.000',
                'available' => $user->total_points >= 100,
            ],
            [
                'id' => 2,
                'points' => 500,
                'amount' => 5000,
                'formatted_amount' => 'Rp 5.000',
                'available' => $user->total_points >= 500,
            ],
            [
                'id' => 3,
                'points' => 1000,
                'amount' => 10000,
                'formatted_amount' => 'Rp 10.000',
                'available' => $user->total_points >= 1000,
            ],
            [
                'id' => 4,
                'points' => 5000,
                'amount' => 50000,
                'formatted_amount' => 'Rp 50.000',
                'available' => $user->total_points >= 5000,
            ],
            [
                'id' => 5,
                'points' => 10000,
                'amount' => 100000,
                'formatted_amount' => 'Rp 100.000',
                'available' => $user->total_points >= 10000,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'packages' => $packages,
                'user_points' => $user->total_points,
            ]
        ], 200);
    }

    /**
     * Simulate payment processing
     * In production, integrate with actual payment gateway (Midtrans, Xendit, etc.)
     */
    private function processPayment($ewalletType, $account, $amount)
    {
        // TODO: Integrate with actual payment gateway
        // Example: Midtrans, Xendit, or direct e-wallet API

        // For now, simulate success
        return true;
    }
}
