<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\SmartBinController;
use App\Http\Controllers\Api\RedeemController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserManagementController;

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
        
        Route::middleware('auth:api')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Smart Bin public routes
    // Note: For role-based access, you can protect routes like this:
    // Route::post('/', [SmartBinController::class, 'store'])->middleware('role:admin|operator');
    Route::prefix('smart-bins')->group(function () {
        Route::get('/', [SmartBinController::class, 'index']);
        Route::get('/{id}', [SmartBinController::class, 'show']);
        Route::post('/', [SmartBinController::class, 'store']);

        // For Smart Bin device authentication
        Route::post('/validate', [SmartBinController::class, 'validateUser']);
        Route::get('/by-code/{code}', [SmartBinController::class, 'byCode']);
        Route::post('/{id}/heartbeat', [SmartBinController::class, 'heartbeat']);
        Route::put('/{id}/status', [SmartBinController::class, 'updateStatus']);
    });

    // Transaction creation by Smart Bin (no user auth required)
    Route::post('/transactions/deposit', [TransactionController::class, 'createDeposit']);
    // Admin routes
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::apiResource('smart-bins', SmartBinController::class);

    // User Management for Admin
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);
        Route::get('/{id}', [UserManagementController::class, 'show']);
        Route::put('/{id}/status', [UserManagementController::class, 'updateStatus']);
        Route::post('/bulk-status', [UserManagementController::class, 'bulkUpdateStatus']);
    });

    // Finance Management for Admin
    Route::prefix('admin/finance')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\FinanceController::class, 'getDashboard']);
        Route::get('/income', [\App\Http\Controllers\Api\FinanceController::class, 'getIncomeList']);
        Route::get('/expense', [\App\Http\Controllers\Api\FinanceController::class, 'getExpenseList']);
        Route::put('/settings', [\App\Http\Controllers\Api\FinanceController::class, 'updateSettings']);
        Route::get('/export', [\App\Http\Controllers\Api\FinanceController::class, 'exportReport']);
        Route::post('/ledger', [\App\Http\Controllers\Api\FinanceController::class, 'storeLedger']);
    });

    // Redeem Management for Admin
    Route::prefix('admin/redeem')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\RedeemManagementController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\RedeemManagementController::class, 'stats']);
        Route::put('/{id}/status', [\App\Http\Controllers\Api\RedeemManagementController::class, 'updateStatus']);
    });

    // Role management routes (Moved here for development access)
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::get('/permissions', [RoleController::class, 'getPermissions']);
        Route::get('/{id}', [RoleController::class, 'show']);
        Route::post('/', [RoleController::class, 'store']);
        Route::put('/{id}', [RoleController::class, 'update']);
        Route::delete('/{id}', [RoleController::class, 'destroy']);

        // User role assignment
        Route::post('/assign', [RoleController::class, 'assignRoleToUser']);
        Route::post('/remove', [RoleController::class, 'removeRoleFromUser']);
        Route::post('/sync', [RoleController::class, 'syncUserRoles']);
    });
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:api')->group(function () {

    // Profile is already covered by /me in auth prefix, but keeping consistency

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
