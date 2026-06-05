<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CarController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Hash;

// ─── CORS preflight ───────────────────────────────────────────────────────────
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
})->where('any', '.*');

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ─── Auth (protected) ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ─── Cars (public read, no auth needed) ───────────────────────────────────────
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{id}', [CarController::class, 'show']);

// Cars write → protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cars', [CarController::class, 'store']);
    Route::put('/cars/{id}', [CarController::class, 'update']);
    Route::patch('/cars/{id}/toggle-status', [CarController::class, 'toggleStatus']);
    Route::delete('/cars/{id}', [CarController::class, 'destroy']);
});

// ─── Bookings ─────────────────────────────────────────────────────────────────
// ALL booking routes protected → $request->user() is always available
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);   // manager=all, client=own
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
});

// ─── Users / Profile ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);  // avant {id} !
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// ─── Notifications ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications', [NotificationController::class, 'clearAll']);
});

// ─── Documents ────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
});

// ─── Dashboard analytics ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->get('/analytics', function () {
    $bookings = \App\Models\Booking::all();
    $cars     = \App\Models\Car::all();
    $users    = \App\Models\User::all();

    return response()->json([
        'active_rentals'   => $bookings->where('status', 'active')->count(),
        'monthly_revenue'  => $bookings->where('status', '!=', 'cancelled')->sum('total_price'),
        'total_cars'       => $cars->count(),
        'available_cars'   => $cars->where('status', 'available')->count(),
        'total_clients'    => $users->where('role', 'client')->count(),
        'fleet_utilization'=> $cars->count() > 0
            ? round(($cars->where('status', '!=', 'available')->count() / $cars->count()) * 100)
            : 0,
    ]);
});
