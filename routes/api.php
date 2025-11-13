<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\SmartBinController;
use App\Http\Controllers\Api\RedeemController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('v1')->group(function () {

    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Smart Bin public routes
    Route::prefix('smart-bins')->group(function () {
        Route::get('/', [SmartBinController::class, 'index']);
        Route::get('/{id}', [SmartBinController::class, 'show']);

        // For Smart Bin device authentication
        Route::post('/validate-pin', [SmartBinController::class, 'validateUserPin']);
        Route::post('/{id}/heartbeat', [SmartBinController::class, 'heartbeat']);
        Route::put('/{id}/status', [SmartBinController::class, 'updateStatus']);
    });

    // Transaction creation by Smart Bin (no user auth required)
    Route::post('/transactions/deposit', [TransactionController::class, 'createDeposit']);
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth routes (authenticated)
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User profile routes
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/view-pin', [UserController::class, 'viewPin']);
        Route::put('/change-pin', [UserController::class, 'changePin']);
        Route::put('/change-password', [UserController::class, 'changePassword']);
        Route::post('/validate-pin', [UserController::class, 'validatePin']);
    });

    // Transaction routes
    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::get('/points', [TransactionController::class, 'pointHistory']);
        Route::get('/total-points', [TransactionController::class, 'getTotalPoints']);
        Route::get('/{id}', [TransactionController::class, 'show']);
    });

    // Redeem routes
    Route::prefix('redeem')->group(function () {
        Route::get('/options', [RedeemController::class, 'getEwalletOptions']);
        Route::get('/packages', [RedeemController::class, 'getRedeemPackages']);
        Route::post('/calculate', [RedeemController::class, 'calculateRedeem']);
        Route::post('/', [RedeemController::class, 'redeem']);
        Route::get('/history', [RedeemController::class, 'redeemHistory']);
    });
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Smart Bin API',
    ]);
});
