<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * GET /api/bookings
     * - Manager  → toutes les réservations
     * - Client   → seulement ses réservations
     * - Non auth → 401 (route protégée auth:sanctum)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Booking::with([
            'user:id,name,email,avatar',
            'car:id,make,model,image_url,price_per_day'
        ])->latest();

        // Si client → filtrer par user_id, si manager → tout afficher
        if ($user->role !== 'manager') {
            $query->where('user_id', $user->id);
        }

        $bookings = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $bookings,
        ]);
    }

    /**
     * GET /api/bookings/{id}
     */
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['user', 'car'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $booking,
        ]);
    }

    /**
     * POST /api/bookings
     */
    public function store(Request $request): JsonResponse
    {
        $pickup = date('Y-m-d H:i:s', strtotime($request->input('pickup_date', now())));
        $return = date('Y-m-d H:i:s', strtotime($request->input('return_date', now()->addDays(3))));

        $booking = new Booking();
        $booking->user_id       = $request->user()->id;
        $booking->car_id        = (int) $request->input('car_id');
        $booking->pickup_date   = $pickup;
        $booking->return_date   = $return;
        $booking->total_price   = (double) $request->input('total_price', 100);
        $booking->notes         = $request->input('notes', 'Réservation depuis React');
        $booking->status        = 'active';
        $booking->discount_applied = false;
        $booking->discount_amount  = 0;
        $booking->save();

        $car = Car::find($booking->car_id);
        if ($car) {
            $car->update(['status' => 'rented']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully.',
            'data'    => $booking->load(['user:id,name', 'car:id,make,model,image_url,price_per_day']),
        ], 201);
    }

    /**
     * PUT/PATCH /api/bookings/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $booking->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully.',
            'data'    => $booking->fresh()->load(['user', 'car']),
        ]);
    }

    /**
     * PATCH /api/bookings/{id}/cancel
     */
    public function cancel(int $id, Request $request): JsonResponse
    {
        $booking = Booking::with(['user', 'car'])->findOrFail($id);

        if (!$booking->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => $booking->status !== 'active'
                    ? "Booking is already {$booking->status}."
                    : 'Cancellation is not allowed within 24 hours of pickup.',
            ], 422);
        }

        $reason = $request->input('reason', 'Cancelled by client.');
        $booking->cancel($reason);

        $booking->car->update(['status' => 'available']);

        Notification::notifyManagers(
            'cancellation',
            'Booking Cancelled',
            "{$booking->user->name} cancelled booking #{$booking->id} for {$booking->car->make} {$booking->car->model}.",
            ['booking_id' => $booking->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
            'data'    => $booking->fresh()->load(['user:id,name', 'car:id,make,model,image_url,price_per_day']),
        ]);
    }

    /**
     * DELETE /api/bookings/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted.',
        ]);
    }
}
