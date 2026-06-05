<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'data'    => 'array',
    ];

    /* ── Relations ── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* ── Scopes ── */

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForManager($query)
    {
        return $query->whereHas('user', fn($q) => $q->where('role', 'manager'));
    }

    /* ── Helpers ── */

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        if (!$this->isRead()) {
            $this->update(['read_at' => now()]);
        }
    }

    /* ── Static factory methods ── */

    public static function notifyManagers(string $type, string $title, string $message, array $data = []): void
    {
        $managers = User::where('role', 'manager')->get();

        foreach ($managers as $manager) {
            self::create([
                'user_id' => $manager->id,
                'type'    => $type,
                'title'   => $title,
                'message' => $message,
                'data'    => $data,
            ]);
        }
    }
}
