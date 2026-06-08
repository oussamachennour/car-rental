<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'pickup_date',
        'return_date',
        'total_price',
        'status',
        'discount_applied',
        'discount_amount',
        'notes',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        // ✅ 'date' (sans 'datetime') sérialise en Y-m-d dans le JSON
        //    Au lieu de '2026-06-03T00:00:00.000000Z', on obtient '2026-06-03'
        'pickup_date'     => 'date:Y-m-d',
        'return_date'     => 'date:Y-m-d',
        'cancelled_at'    => 'datetime',
        'total_price'     => 'float',
        'discount_amount' => 'float',
        'discount_applied'=> 'boolean',
    ];

    /* ── Relations ── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /* ── Scopes ── */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /* ── Helpers ── */

    public function getDurationInDays(): int
    {
        return max(1, $this->pickup_date->diffInDays($this->return_date));
    }

    public function canBeCancelled(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }
        return now()->diffInHours($this->pickup_date, false) > 24;
    }

    public function cancel(?string $reason = null): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now(),
            'cancellation_reason' => $reason,
        ]);

        return true;
    }
}