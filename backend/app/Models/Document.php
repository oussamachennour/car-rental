<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'verified_at',
        'verified_by',
        'rejection_reason',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'file_size'   => 'integer',
    ];

    /* ── Relations ── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /* ── Scopes ── */

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /* ── Helpers ── */

    public function getFormattedSizeAttribute(): string
    {
        $size = $this->file_size;
        if ($size >= 1048576) return round($size / 1048576, 1) . ' MB';
        if ($size >= 1024)    return round($size / 1024, 1) . ' KB';
        return $size . ' B';
    }

    public function verify(int $verifiedBy): void
    {
        $this->update([
            'status'      => 'verified',
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status'           => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }
}
