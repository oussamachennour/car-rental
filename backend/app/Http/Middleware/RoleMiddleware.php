<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Restrict access based on user role.
     * Usage in routes: ->middleware('role:manager') or ->middleware('role:client')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // In a real app, retrieve user from the authenticated session.
        // Here we check a X-User-Role header (set by frontend for demo).
        $userRole = $request->header('X-User-Role', 'client');

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Required role: ' . implode(' or ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
