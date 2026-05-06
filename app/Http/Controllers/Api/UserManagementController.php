<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $query = User::whereDoesntHave('roles', function($q) {
            $q->whereIn('name', ['admin', 'operator', 'finance']);
        });

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->latest()->paginate($request->get('per_page', 10));

        // Get counts for each status
        $baseQuery = User::whereDoesntHave('roles', function($q) {
            $q->whereIn('name', ['admin', 'operator', 'finance']);
        });

        $stats = [
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'active' => (clone $baseQuery)->where('status', 'active')->count(),
            'suspended' => (clone $baseQuery)->where('status', 'suspended')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $users,
            'stats' => $stats
        ]);
    }

    /**
     * Display the specified user profile.
     */
    public function show($id)
    {
        $user = User::with(['transactions' => function($q) {
            $q->latest()->limit(5);
        }, 'pointTransactions' => function($q) {
            $q->latest()->limit(5);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update user status (Approve, Reject, Suspend, Activate).
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,active,suspended',
            'rejection_reason' => 'required_if:status,pending|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);
        
        $oldStatus = $user->status;
        $newStatus = $request->status;

        $updateData = [
            'status' => $newStatus,
        ];

        // If approving
        if ($newStatus === 'active') {
            $updateData['is_verified'] = true;
            $updateData['rejection_reason'] = null;
        }

        // If rejecting (set back to pending or handle separately, usually we might have a 'rejected' status)
        // For simplicity, let's just update the status as requested
        if ($request->has('rejection_reason')) {
            $updateData['rejection_reason'] = $request->rejection_reason;
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "User status updated from {$oldStatus} to {$newStatus}",
            'data' => $user
        ]);
    }

    /**
     * Bulk actions (optional but useful).
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
            'status' => 'required|in:active,suspended',
        ]);

        User::whereIn('id', $request->ids)->update([
            'status' => $request->status,
            'is_verified' => $request->status === 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bulk update successful'
        ]);
    }
}
