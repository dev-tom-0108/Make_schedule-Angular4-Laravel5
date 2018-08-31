<?php

namespace App\Http\Middleware;

use Closure;

class RequestValidator
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $rule_name)
    {
        if (!empty($rule_name)) {
            $rule = config( key: 'rules')[$rule_name];
            
            if (!empty($rule)) {
                $validator = Validator::make($request->all(), $rule);

                if ($validator->fails()) {
                    $return_code = 'PAYLOAD_INVALID';

                    return response()->json([
                        'return_code' => $return_code,
                        'message' => config( key: 'messages')[$return_code],
                        'data' => $validator->errors()
                    ], status:400)
                }
            }
        }
        return $next($request);
    }
}
