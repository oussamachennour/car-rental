<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CarController extends Controller
{
    /**
     * GET /api/cars
     * List all cars with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Car::query();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter available only
        if ($request->boolean('available_only')) {
            $query->available();
        }

        // Filter student-friendly
        if ($request->boolean('student')) {
            $query->studentFriendly();
        }

        // Search by make or model
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('make', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy  = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'asc');
        $allowedSorts = ['price_per_day', 'rating', 'year', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $cars = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $cars,
            'total'   => $cars->count(),
        ]);
    }

    /**
     * GET /api/cars/{id}
     * Show a single car with its active bookings count.
     */
    public function show(int $id): JsonResponse
    {
        $car = Car::with(['bookings' => fn($q) => $q->active()])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $car,
        ]);
    }

    /**
     * POST /api/cars
     * Create a new car (manager only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'make'               => 'required|string|max:100',
            'model'              => 'required|string|max:100',
            'year'               => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'category'           => ['required', Rule::in(['economy', 'suv', 'luxury', 'van', 'sports'])],
            'price_per_day'      => 'required|numeric|min:1',
            'seats'              => 'required|integer|min:2|max:9',
            'transmission'       => ['required', Rule::in(['Manual', 'Automatic'])],
            'fuel_type'          => ['required', Rule::in(['Petrol', 'Diesel', 'Electric', 'Hybrid'])],
            'status'             => ['sometimes', Rule::in(['available', 'rented', 'maintenance', 'unavailable'])],
            'is_student_friendly'=> 'boolean',
            'image_url'          => 'nullable|url|max:500',
            'description'        => 'nullable|string|max:1000',
            'color'              => 'nullable|string|max:50',
            'license_plate'      => 'nullable|string|max:20|unique:cars',
        ]);

        $car = Car::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Car created successfully.',
            'data'    => $car,
        ], 201);
    }

    /**
     * PUT /api/cars/{id}
     * Update a car's details.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'make'               => 'sometimes|string|max:100',
            'model'              => 'sometimes|string|max:100',
            'year'               => 'sometimes|integer|min:2000|max:' . (date('Y') + 1),
            'category'           => ['sometimes', Rule::in(['economy', 'suv', 'luxury', 'van', 'sports'])],
            'price_per_day'      => 'sometimes|numeric|min:1',
            'seats'              => 'sometimes|integer|min:2|max:9',
            'transmission'       => ['sometimes', Rule::in(['Manual', 'Automatic'])],
            'fuel_type'          => ['sometimes', Rule::in(['Petrol', 'Diesel', 'Electric', 'Hybrid'])],
            'status'             => ['sometimes', Rule::in(['available', 'rented', 'maintenance', 'unavailable'])],
            'is_student_friendly'=> 'sometimes|boolean',
            'image_url'          => 'nullable|url|max:500',
            'description'        => 'nullable|string|max:1000',
            'color'              => 'nullable|string|max:50',
            'license_plate'      => 'nullable|string|max:20|unique:cars,license_plate,' . $id,
        ]);

        $car->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Car updated successfully.',
            'data'    => $car->fresh(),
        ]);
    }

    /**
     * PATCH /api/cars/{id}/toggle-status
     * Toggle a car between available and unavailable.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $car = Car::findOrFail($id);

        // Only toggle if not currently rented
        if ($car->status === 'rented') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot toggle status: car is currently rented.',
            ], 422);
        }

        $newStatus = $car->status === 'available' ? 'unavailable' : 'available';
        $car->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Car status changed to {$newStatus}.",
            'data'    => $car->fresh(),
        ]);
    }

    /**
     * DELETE /api/cars/{id}
     * Soft-delete / remove a car (only if not actively rented).
     */
    public function destroy(int $id): JsonResponse
    {
        $car = Car::findOrFail($id);

        if ($car->bookings()->active()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a car with active bookings.',
            ], 422);
        }

        $car->delete();

        return response()->json([
            'success' => true,
            'message' => 'Car deleted successfully.',
        ]);
    }
}
