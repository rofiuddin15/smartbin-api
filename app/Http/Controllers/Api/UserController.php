<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'total_points' => $user->total_points,
                'created_at' => $user->created_at,
            ]
        ], 200);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|unique:users,phone_number,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'phone_number']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'total_points' => $user->total_points,
            ]
        ], 200);
    }

    /**
     * View PIN (for user reference)
     */
    public function viewPin(Request $request)
    {
        // In production, add extra security like password confirmation
        $validator = Validator::make($request->all(), [
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'PIN retrieved successfully',
            'data' => [
                'info' => 'Your PIN is hashed and cannot be displayed. Please remember your PIN or reset it.'
            ]
        ], 200);
    }

    /**
     * Change PIN
     */
    public function changePin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_pin' => 'required|string',
            'new_pin' => 'required|string|min:4|max:6|different:current_pin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_pin, $user->pin)) {
            return response()->json([
                'success' => false,
                'message' => 'Current PIN is incorrect'
            ], 401);
        }

        $user->pin = Hash::make($request->new_pin);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'PIN changed successfully'
        ], 200);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed|different:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ], 200);
    }

    /**
     * Validate PIN (for Smart Bin authentication)
     */
    public function validatePin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pin' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->pin, $user->pin)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid PIN'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'PIN validated successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'total_points' => $user->total_points,
                ]
            ]
        ], 200);
    }
}
