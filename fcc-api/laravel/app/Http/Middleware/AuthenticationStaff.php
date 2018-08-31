<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Providers\User\EloquentUserAdapter;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
class AuthenticationStaff
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        
        // use 'api_admin' as default guard
        Auth::shouldUse('api_admin');
        // change user model for jwt user provider
        $app = App::getFacadeRoot();
        $app->singleton('tymon.jwt.provider.user', function ($app) {
            $model = $app->make(\App\Models\Staff::class);
            return new EloquentUserAdapter($model);
        });

        // check token
        try{
            // $user = JWTAuth::toUser($request->input('token'));
            $authHeader = $request->headers->get('Authorization');
            $token = null;
            if (isset($authHeader)) {
                $matches = array();
                preg_match("/^Bearer\\s+(.*?)$/", $authHeader, $matches);
                if(isset($matches[1])){
                  $token = $matches[1];
                }
            }
            $user = JWTAuth::toUser($token);
            
        }catch (JWTException $e) {
            if($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json(['token_expired'], $e->getStatusCode());
            }else if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json(['token_invalid'], $e->getStatusCode());
            }else{
                return response()->json(['error'=>'Token is required'], 401);
            }
        }

        $request->headers->user = $user;
        $request->headers->user_type = 'STAFF';
        return $next($request);
    }
}
