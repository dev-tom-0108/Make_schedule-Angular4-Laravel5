<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Providers\User\EloquentUserAdapter;

class AuthenticationGuest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // use 'api_guest' as default guard
        Auth::shouldUse('api_guest');
        // change user model for jwt user provider
        $app = App::getFacadeRoot();
        $app->singleton('tymon.jwt.provider.user', function ($app) {
            $model = $app->make(\App\Models\Guest::class);
            return new EloquentUserAdapter($model);
        });

        // check token
        try{
            $user = JWTAuth::toUser($request->input('token'));

        }catch (JWTException $e) {
            if($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json(['token_expired'], $e->getStatusCode());
            }else if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json(['token_invalid'], $e->getStatusCode());
            }else{
                return response()->json(['error'=>'Token is required']);
            }
        }
        $request->headers->user = $user;
        $request->headers->user_type = 'GUEST';
        return $next($request);
    }
}
