<?php
/**
 * Created by PhpStorm.
 * User: Keyin
 * Date: 3/24/17
 * Time: 12:55 AM
 */

class WxOpenApi {

    //const APP_ID = 'wx611fdd9bc02adce1';
    //const APP_SECRET = '4eb0366b91de5f7cd66a364945d52d15';

    const APP_WEB = 0;
    const APP_OFFICIAL = 1;

    const APPS = [
        [
            'APP_ID' => 'wx52373715406d139e',
            'APP_SECRET' => 'd126b4a304d887d769a8b5b238073429'
        ],
        [
            'APP_ID' => 'wx611fdd9bc02adce1',
            'APP_SECRET' => '4eb0366b91de5f7cd66a364945d52d15'
        ]
    ];

    const OPEN_BASE_URL = 'https://open.weixin.qq.com';
    const API_BASE_URL = 'https://api.weixin.qq.com';

    const MESSAGE_TEMPLATE_ID_DEPOSIT = 'wMwlW7d-LgZN27UTti61JwOUulxywEc1sa8NIsimuW8';
    const MESSAGE_TEMPLATE_ID_WITHDRAW = '9QzxDWHNm5xmf-8ARxpjvYQJoYwI8XCXK80Bm_uWf2c';
    const MESSAGE_TEMPLATE_ID_GENERAL = 'MG69Rt5bkANXvxv88aP9mOxsyag-UoFqmUGkkQ8sj48';

    private $token = null;
    private $jsapi_ticket = null;

    public function getOpenAuthorizeUrl($state, $scope, $redirect_uri, $app) {

        $url = WxOpenApi::OPEN_BASE_URL
            .'/connect/oauth2/authorize?'
            .'appid=' . WxOpenApi::APPS[$app]['APP_ID'] . '&'
            .'redirect_uri=' . $redirect_uri . '&'
            .'response_type=code&'
            .'state=' . $state . '&'
            .'scope=' .$scope. '#wechat_redirect';

        return $url;
    }

    public function getQrConnectUrl($state, $scope, $redirect_uri, $app) {

        $url = WxOpenApi::OPEN_BASE_URL
            .'/connect/qrconnect?'
            .'appid=' . WxOpenApi::APPS[$app]['APP_ID'] . '&'
            .'redirect_uri=' . $redirect_uri . '&'
            .'response_type=code&'
            .'state=' . $state . '&'
            .'scope=' .$scope. '#wechat_redirect';

        return $url;
    }

    public function getUserInfo($auth_code, $app) {

        $this->requestTokenByAuthCode($auth_code, $app);

        if(!empty($this->token)) {

            //get profile data
            $url = WxOpenApi::API_BASE_URL
                .'/sns/userinfo?'
                .'access_token='.$this->token->access_token.'&'
                .'openid='.$this->token->openid.'&'
                .'lang=zh_CN ';

            $profile_obj_str = $this->curl($url, null, false, null);

            $profile_obj = json_decode($profile_obj_str);

            return $profile_obj;

        } else {
            return null;
        }

    }

    public function sendMessageDeposit($openid, $first, $accountType, $account, $amount, $result, $remark = null, $link_url = null) {

        $this->requestTokenByCredential(self::APP_OFFICIAL);

        $data = [
            'first' => [
                'value' => $first,
                'color' => '#173177'
            ],
            'accountType' => [
                'value' => $accountType
            ],
            'account' => [
                'value' => $account,
                'color' => '#173177'
            ],
            'amount' => [
                'value' => $amount,
                'color' => '#173177'
            ],
            'result' => [
                'value' => $result,
                'color' => '#173177'
            ]
        ];
        if(!empty($remark)) {
            $data['remark'] = ['value'=>$remark];
        }

        $this->sendNotification($openid, WxOpenApi::MESSAGE_TEMPLATE_ID_DEPOSIT, $data, $link_url);
    }

    public function sendMessageGeneral($openid, $first, $type, $status, $time, $sender, $remark = null, $link_url = null) {

        $this->requestTokenByCredential(self::APP_OFFICIAL);

        $data = [
            'first' => [
                'value' => $first,
                'color' => '#173177'
            ],
            'keyword1' => [
                'value' => $type,
                'color' => '#173177'
            ],
            'keyword2' => [
                'value' => $status,
                'color' => '#173177'
            ],
            'keyword3' => [
                'value' => $time,
                'color' => '#173177'
            ],
            'keyword4' => [
                'value' => $sender,
                'color' => '#173177'
            ]
        ];

        if(!empty($remark)) {
            $data['remark'] = ['value'=>$remark];
        }

        $this->sendNotification($openid, WxOpenApi::MESSAGE_TEMPLATE_ID_GENERAL, $data, $link_url);
    }

    public function getSignPackage($url) {

        $this->getJsApiTicket();

        if(!empty($this->jsapi_ticket)) {
            // 注意 URL 一定要动态获取，不能 hardcode.
            //$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            //$url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            //$url = 'http://testing.wotip.cn/wechat_h5/v2/#/workshops/298';

            $timestamp = time();
            $nonceStr = $this->createNonceStr();

            // 这里参数的顺序要按照 key 值 ASCII 码升序排序
            $string = "jsapi_ticket=".$this->jsapi_ticket->ticket."&noncestr=$nonceStr&timestamp=$timestamp&url=$url";

            $signature = sha1($string);

            $signPackage = array(
                "appId"     => WxOpenApi::APPS[self::APP_OFFICIAL]['APP_ID'],
                "nonceStr"  => $nonceStr,
                "timestamp" => $timestamp,
                "url"       => $url,
                "signature" => $signature,
                "rawString" => $string
            );
            return $signPackage;
        } else {
            return null;
        }

    }

    private function sendNotification($openid, $template_id, $data, $link_url) {

        $url = WxOpenApi::API_BASE_URL
            .'/cgi-bin/message/template/send?'
            .'access_token='.$this->token->access_token;

        $params = [
            'touser' => $openid,
            'template_id' => $template_id,
            'data' => $data
        ];

        if(!empty($link_url)) {
            $params['url'] = $link_url;
        }

        $this->curl($url, null, true, json_encode($params));
    }

    private function createNonceStr($length = 16) {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for ($i = 0; $i < $length; $i++) {
            $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
        }
        return $str;
    }

    private function getJsApiTicket() {

        $this->requestTokenByCredential(self::APP_OFFICIAL);

        if(!empty($this->token)) {
            $url = WxOpenApi::API_BASE_URL
                .'/cgi-bin/ticket/getticket?'
                .'type=jsapi&'
                .'access_token='.$this->token->access_token;

            $ticket_obj_str = $this->curl($url, null, false, null);

            $ticket_obj = json_decode($ticket_obj_str);

            if(!empty($ticket_obj) && !empty($ticket_obj->ticket)) {
                $this->jsapi_ticket = $ticket_obj;
            }
        }
    }

    private function requestTokenByAuthCode($auth_code, $app) {

        if(!empty($this->token) && $this->token->expires_time > time()) {
            return;
        }

        $url = WxOpenApi::API_BASE_URL
            .'/sns/oauth2/access_token?'
            .'appid='.WxOpenApi::APPS[$app]['APP_ID'].'&'
            .'secret='.WxOpenApi::APPS[$app]['APP_SECRET'].'&'
            .'grant_type=authorization_code&'
            .'code='.$auth_code;

        $token_obj_str = $this->curl($url, null, false, null);

        $token_obj = json_decode($token_obj_str);

        if(!empty($token_obj) && !empty($token_obj->access_token)) {
            $this->token = $token_obj;
            $this->token->expires_time = time() + $token_obj->expires_in;
        }
    }

    private function requestTokenByCredential($app) {

        if(!empty($this->token) && $this->token->expires_time > time()) {
            return;
        }

        $url = WxOpenApi::API_BASE_URL
            .'/cgi-bin/token?'
            .'appid='.WxOpenApi::APPS[$app]['APP_ID'].'&'
            .'secret='.WxOpenApi::APPS[$app]['APP_SECRET'].'&'
            .'grant_type=client_credential';

        $token_obj_str = $this->curl($url, null, false, null);

        $token_obj = json_decode($token_obj_str);

        if(!empty($token_obj) && !empty($token_obj->access_token)) {
            $this->token = $token_obj;
            $this->token->expires_time = time() + $token_obj->expires_in;
        }
    }

    private function curl($url, $header, $post, $post_fields){
        $ch = curl_init();
        //$header = "Content-Type: application/x-www-form-urlencoded";
        curl_setopt($ch, CURLOPT_URL, $url);
        //curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        //curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
        //curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        //curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
        //curl_setopt ($ch,CURLOPT_REFERER, $url);

        if(!empty($header)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        }

        if(!empty($post)) {
            curl_setopt($ch, CURLOPT_POST, true);
            if(!empty($post_fields)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
            }
        } else {

        }

        $temp = curl_exec($ch);
        curl_close($ch);

        return $temp;
    }

}