<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * - Manager → toutes les notifications
     * - Client  → seulement ses notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Notification::with('user:id,name,avatar')->latest();

        if ($user->role === 'manager') {
            // Manager voit toutes les notifications qui lui sont destinées
            // (user_id = son id OU notifs globales managers)
            $query->where('user_id', $user->id);
        } else {
            // Client voit uniquement ses propres notifications
            $query->where('user_id', $user->id);
        }

        // Filtre optionnel par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre non lues
        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $notifications,
            'unread'  => $notifications->whereNull('read_at')->count(),
        ]);
    }

    /**
     * POST /api/notifications
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'    => 'nullable|exists:users,id',
            'type'       => 'required|string|in:cancellation,document,profile,new_booking,system,alert',
            'title'      => 'required|string|max:255',
            'message'    => 'required|string|max:1000',
            'data'       => 'nullable|array',
            'action_url' => 'nullable|url|max:500',
            'target'     => 'nullable|in:managers,all,user',
        ]);

        $target = $request->input('target', 'user');

        if ($target === 'managers') {
            Notification::notifyManagers(
                $validated['type'],
                $validated['title'],
                $validated['message'],
                $validated['data'] ?? []
            );
            return response()->json([
                'success' => true,
                'message' => 'Notification sent to all managers.',
            ], 201);
        }

        $notification = Notification::create([
            'user_id'    => $validated['user_id'] ?? $request->user()->id,
            'type'       => $validated['type'],
            'title'      => $validated['title'],
            'message'    => $validated['message'],
            'data'       => $validated['data'] ?? null,
            'action_url' => $validated['action_url'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification created.',
            'data'    => $notification,
        ], 201);
    }

    /**
     * PATCH /api/notifications/{id}/read
     */
    public function markRead(int $id, Request $request): JsonResponse
    {
        // S'assurer que la notif appartient bien à l'utilisateur connecté
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
            'data'    => $notification->fresh(),
        ]);
    }

    /**
     * PATCH /api/notifications/read-all
     * Marque toutes les notifs de l'utilisateur connecté comme lues.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * DELETE /api/notifications
     * Supprime toutes les notifs de l'utilisateur connecté uniquement.
     */
    public function clearAll(Request $request): JsonResponse
    {
        $deleted = Notification::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deleted} notification(s) deleted.",
        ]);
    }
}