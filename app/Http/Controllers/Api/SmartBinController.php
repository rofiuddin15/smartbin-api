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
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('bin_code', 'like', "%{$search}%");
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
     * Register a new smart bin device
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bin_code' => 'required|string|unique:smart_bins,bin_code',
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'responsible_person' => 'nullable|string|max:255',
            'username' => 'required|string|unique:smart_bins,username',
            'password' => 'required|string|min:6',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Kesalahan validasi data',
                'errors' => $validator->errors()
            ], 422);
        }

        $smartBin = SmartBin::create([
            'bin_code' => $request->bin_code,
            'name' => $request->name,
            'location' => $request->location,
            'responsible_person' => $request->responsible_person,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'offline',
            'capacity_percentage' => 0,
            'total_bottles_collected' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'SmartBin berhasil didaftarkan',
            'data' => $smartBin
        ], 201);
    }

    /**
     * Update an existing smart bin
     */
    public function update(Request $request, $id)
    {
        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'SmartBin tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bin_code' => 'sometimes|string|unique:smart_bins,bin_code,' . $id,
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'responsible_person' => 'nullable|string|max:255',
            'username' => 'sometimes|string|unique:smart_bins,username,' . $id,
            'password' => 'nullable|string|min:6',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'sometimes|in:online,offline,full,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Kesalahan validasi data',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['bin_code', 'name', 'location', 'responsible_person', 'username', 'latitude', 'longitude', 'status']);
        
        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $bin->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data SmartBin berhasil diperbarui',
            'data' => $bin
        ], 200);
    }

    /**
     * Delete a smart bin
     */
    public function destroy($id)
    {
        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'SmartBin tidak ditemukan'
            ], 404);
        }

        $bin->delete();

        return response()->json([
            'success' => true,
            'message' => 'SmartBin berhasil dihapus'
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
                'message' => 'SmartBin tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bin
        ], 200);
    }

    /**
     * Get smart bin details by code
     */
    public function byCode($code)
    {
        $bin = SmartBin::where('bin_code', $code)->first();

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'SmartBin dengan kode tersebut tidak ditemukan'
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
                'message' => 'Kesalahan validasi data',
                'errors' => $validator->errors()
            ], 422);
        }

        $bin = SmartBin::find($id);

        if (!$bin) {
            return response()->json([
                'success' => false,
                'message' => 'SmartBin tidak ditemukan'
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
            'message' => 'Status SmartBin berhasil diperbarui',
            'data' => $bin
        ], 200);
    }

    /**
     * Validate user by PIN or KTP at Smart Bin
     */
    public function validateUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required|string', // PIN or KTP ID
            'type' => 'required|in:pin,ktp',
            'smart_bin_id' => 'required|exists:smart_bins,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Kesalahan validasi data',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = null;
        if ($request->type === 'pin') {
            // Find user by PIN (assuming PIN is unique enough or we have a better way)
            // Ideally we'd have a user identifier + PIN, but for kiosk convenience:
            $users = User::where('status', 'active')->get();
            foreach ($users as $u) {
                if (Hash::check($request->identifier, $u->pin)) {
                    $user = $u;
                    break;
                }
            }
        } else {
            // Find by E-KTP ID
            $user = User::where('ktp_id', $request->identifier)
                        ->where('status', 'active')
                        ->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan atau belum terverifikasi'
            ], 401);
        }

        $smartBin = SmartBin::find($request->smart_bin_id);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil divalidasi',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'total_points' => $user->total_points,
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
                'message' => 'SmartBin tidak ditemukan'
            ], 404);
        }

        $bin->last_online_at = now();
        $bin->status = 'online';
        $bin->save();

        return response()->json([
            'success' => true,
            'message' => 'Sinyal heartbeat diterima'
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
