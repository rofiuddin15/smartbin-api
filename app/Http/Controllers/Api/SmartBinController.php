<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SmartBin;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Events\SmartBinStatusUpdated;

class SmartBinController extends Controller
{
    /**
     * Get all smart bins (with optional filtering)
     */
    public function index(Request $request)
    {
        $query = SmartBin::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or location
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Get nearby bins (if lat/lng provided)
        if ($request->has('latitude') && $request->has('longitude')) {
            // Simple distance calculation using Haversine formula
            // In production, use a proper spatial query
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->input('radius', 10); // km

            $bins = $query->get()->filter(function($bin) use ($lat, $lng, $radius) {
                if (!$bin->latitude || !$bin->longitude) {
                    return false;
                }
                $distance = $this->calculateDistance($lat, $lng, $bin->latitude, $bin->longitude);
                return $distance <= $radius;
            });

            return response()->json([
                'success' => true,
                'data' => $bins->values()
            ], 200);
        }

        $bins = $query->get();

        return response()->json([
            'success' => true,
            'data' => $bins
        ], 200);
    }

    /**
     * Get smart bin details
     */
    public function show($id)
    {
        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'Smart bin not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bin
        ], 200);
    }

    /**
     * Update smart bin status (for IoT device)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:online,offline,full,maintenance',
            'capacity_percentage' => 'sometimes|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'Smart bin not found'
            ], 404);
        }

        $bin->status = $request->status;

        if ($request->has('capacity_percentage')) {
            $bin->capacity_percentage = $request->capacity_percentage;
        }

        if ($request->status === 'online') {
            $bin->last_online_at = now();
        }

        $bin->save();

        // Dispatch real-time event
        event(new SmartBinStatusUpdated($bin));

        return response()->json([
            'success' => true,
            'message' => 'Smart bin status updated',
            'data' => $bin
        ], 200);
    }

    /**
     * Validate user PIN at Smart Bin
     */
    public function validateUserPin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pin' => 'required|string',
            'smart_bin_id' => 'required|exists:smart_bins,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by checking all users' PINs
        // Note: This is for bin authentication, not optimal for production
        // Consider using user_id or phone_number along with PIN
        $users = User::all();
        $authenticatedUser = null;

        foreach ($users as $user) {
            if (Hash::check($request->pin, $user->pin)) {
                $authenticatedUser = $user;
                break;
            }
        }

        if (!$authenticatedUser) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid PIN'
            ], 401);
        }

        $smartBin = SmartBin::find($request->smart_bin_id);

        return response()->json([
            'success' => true,
            'message' => 'PIN validated successfully',
            'data' => [
                'user' => [
                    'id' => $authenticatedUser->id,
                    'name' => $authenticatedUser->name,
                    'total_points' => $authenticatedUser->total_points,
                ],
                'smart_bin' => [
                    'id' => $smartBin->id,
                    'name' => $smartBin->name,
                    'location' => $smartBin->location,
                ]
            ]
        ], 200);
    }

    /**
     * Heartbeat endpoint for Smart Bin to stay online
     */
    public function heartbeat(Request $request, $id)
    {
        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'Smart bin not found'
            ], 404);
        }

        $bin->last_online_at = now();
        $bin->status = 'online';
        $bin->save();

        return response()->json([
            'success' => true,
            'message' => 'Heartbeat received'
        ], 200);
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return $distance;
    }
}
