<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

require_once base_path().'/libraries/WxopenAPI/WxOpen.Api.php';

class WechatController extends ApiController
{
    private $wxOpenApi;

    public function __construct()
    {
        parent::__construct();

        $this->wxOpenApi = new \WxOpenApi();
    }

    public function authJs(Request $request) {

        $csrf = time();
        $callback_url = $request->callback_url;

        $request->session()->put('wechat_callback_url', $callback_url);
        $request->session()->put('wechat_csrf', $csrf);
        $request->session()->put('wechat_app', \WxOpenApi::APP_OFFICIAL);

        $url = $this->wxOpenApi->getOpenAuthorizeUrl($csrf, 'snsapi_userinfo', url('/api/app/wechat/auth_redirect'), \WxOpenApi::APP_OFFICIAL);
        return redirect($url);
    }

    public function authQr(Request $request) {

        $csrf = time();
        $callback_url = $request->callback_url;

        $request->session()->put('wechat_callback_url', $callback_url);
        $request->session()->put('wechat_csrf', $csrf);
        $request->session()->put('wechat_app', \WxOpenApi::APP_WEB);

        $url = $this->wxOpenApi->getQrConnectUrl($csrf, 'snsapi_login', url('/api/app/wechat/auth_redirect'), \WxOpenApi::APP_WEB);
        return redirect($url);
    }

    public function authRedirect(Request $request) {

        $code = $request->code;
        $state = $request->state;
        $error = $request->error;

        $callback_url = $request->session()->get('wechat_callback_url');
        $csrf = $request->session()->get('wechat_csrf');
        $app = $request->session()->get('wechat_app');

        //check csrf
        if($state == $csrf) {
            if(!empty($error)) {
                $callback_url = $this->addQueryParam($callback_url, 'error='.$error);
                return redirect($callback_url);
            } else {

                $profile_obj = $this->wxOpenApi->getUserInfo($code, $app);

                if(!empty($profile_obj)) {

                    $openid = $profile_obj->openid;
                    $nickname = $profile_obj->nickname;

                    $callback_url = $this->addQueryParam($callback_url,'wechat_openid='.$openid);
                    $callback_url = $this->addQueryParam($callback_url,'wechat_nickname='.$nickname);

                    return redirect($callback_url);

                } else {
                    $callback_url = $this->addQueryParam($callback_url,'error=unknown');
                    return redirect($callback_url);
                }
            }
        } else {
            $callback_url = $this->addQueryParam($callback_url,'error=csrf');
            return redirect($callback_url);
        }
    }

    private function addQueryParam($url, $params) {
        $urls = explode('?', $url);
        if(count($urls) > 1) {
            return $urls[0].'?'.$params.'&'.$urls[1];
        } else {
            return $urls[0].'?'.$params;
        }
    }
}
