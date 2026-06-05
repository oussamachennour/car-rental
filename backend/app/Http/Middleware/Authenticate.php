<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request)
    {
        // ✅ مهم: إذا كان request لـ API, ما تredirectش
        if ($request->expectsJson() || str_starts_with($request->path(), 'api/')) {
            return null;
        }
        
        // return route('login');
    }
}
