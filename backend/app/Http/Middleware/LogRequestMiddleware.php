<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogRequestMiddleware
{
    /**
     * Log every API request with method, URL, status and duration.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $start) * 1000, 2);

        Log::channel('stack')->info('API Request', [
            'method'   => $request->method(),
            'url'      => $request->fullUrl(),
            'ip'       => $request->ip(),
            'status'   => $response->getStatusCode(),
            'duration' => "{$duration}ms",
        ]);

        return $response;
    }
}
