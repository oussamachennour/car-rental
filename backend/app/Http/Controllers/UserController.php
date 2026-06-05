<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * GET /api/users
     * عرض جميع المستخدمين (Manager Dashboard)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->select(['id', 'name', 'email', 'phone', 'role', 'avatar', 'is_student', 'created_at']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
            'total'   => $users->count(),
        ]);
    }

    /**
     * POST /api/users
     * إضافة مستخدم جديد من طرف الـ Manager (Create)
     */
    public function store(Request $request): JsonResponse
    {
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->phone = $request->input('phone');
        $user->role = $request->input('role', 'client');
        $user->is_student = (bool) $request->input('is_student', false);
        $user->password = Hash::make($request->input('password', 'password123')); 
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data'    => $user,
        ], 201);
    }

    /**
     * GET /api/users/{id}
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with([
            'bookings.car:id,make,model,image_url,price_per_day',
            'documents',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    /**
     * PUT/PATCH /api/users/{id}
     * تعديل بيانات مستخدم من طرف الـ Manager (Update)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email', $user->email);
        $user->phone = $request->input('phone', $user->phone);
        $user->role = $request->input('role', $user->role);
        $user->is_student = $request->has('is_student') ? (bool) $request->input('is_student') : $user->is_student;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * DELETE /api/users/{id}
     * حذف مستخدم (Delete)
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // مسح الحجوزات المرتبطة به أولاً لتفادي مشاكل الـ Constraints
        $user->bookings()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
        public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user(); // أو auth()->user()

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email', $user->email);
        $user->phone = $request->input('phone', $user->phone);

        $user->is_student = $request->has('is_student')
            ? (bool) $request->input('is_student')
            : $user->is_student;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

}