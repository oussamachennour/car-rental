<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'make',
        'model',
        'year',
        'category',
        'price_per_day',
        'seats',
        'transmission',
        'fuel_type',
        'status',
        'is_student_friendly',
        'image_url',
        'rating',
        'reviews',
        'description',
        'mileage',
        'color',
        'license_plate',
    ];

    protected $casts = [
        'price_per_day'      => 'float',
        'rating'             => 'float',
        'reviews'            => 'integer',
        'seats'              => 'integer',
        'year'               => 'integer',
        'mileage'            => 'integer',
        'is_student_friendly'=> 'boolean',
        'pickup_date' => 'date:Y-m-d',
        'return_date' => 'date:Y-m-d',
    ];
// protected $casts = [
//     'pickup_date' => 'date:Y-m-d',
//     'return_date' => 'date:Y-m-d',
// ];
    /* ── Relations ── */

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /* ── Scopes ── */

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeStudentFriendly($query)
    {
        return $query->where('is_student_friendly', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /* ── Helpers ── */

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function discountedPrice(float $discountRate = 0.30): float
    {
        return round($this->price_per_day * (1 - $discountRate), 2);
    }
}
