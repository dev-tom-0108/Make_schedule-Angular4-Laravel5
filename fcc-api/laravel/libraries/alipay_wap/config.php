<?php
$config = array (	
		//应用ID,您的APPID。
		'app_id' => "2017031006152498",

		//商户私钥，您的原始格式RSA私钥
		'merchant_private_key' => "MIICXQIBAAKBgQCqrNgsXYFeU+spDVkyxf51r0sTfNGP3U3CfFf2V8xX+oIOrxmn+JBGfB7h9pe5kCXeSaqlcfv0FEt0qSkcR467LXXe2hiwps3H9XrpYsyrgcpYYQOYedecWD5e7bmlbTmFMuTWQyJSti+nRrSM5amQblYi+G2n12OrTxTgzrwlHQIDAQABAoGAERN8CWxNjj99Lr1MKF1Q6TthmpCJcwhkSEoijt4X7tF8g7WXLowa+0Jd4KPIaGN4tnXOYgE2gSQqrIBkQZUTPZMp3mV/KEZQ0y3Hw/oxPPD/77rju+vOUQCSz8bJ9zcp0RIDu+lPbfidYYN8QRKtR7HhbFLdQzFgHLzaUcYFzWECQQDSHbJwFSRyVAmipOkfHToVss55I9CfdC1sGXb7aPyI8V5J0+J3EkFl58UX+MEMbHLPtXGQw/2shqsglpMyLz85AkEAz/JAWbYsxGuhQKT5Mwt/28vspn/SfZNieOYSyp6CghbfHknW+3JdcbnrwMy4BI/U6q1prFCvacmXoLqPWGYxBQJBAJQpdrsMXY/07Hpw+SYEkQHd/TR06daWsLTqW/k6deEG+qrqq2W1TMJUJaoasd5V1rvawUMIwSdYKvGm3BLmOBkCQQC7Z5CVCThpQLKPpt4rIab2OF8rYrEZmRU67eZrktT9Vo14J4XHELekQbF1DUqeWd3CLcy5jfG4fgTXxqpfOaHdAkAMrn3RvbNjC+wKnM/ciKq7HiK5brZ6QtPZ/ROs+Wj0yP4WOTJrtYG8MxxfnhvKEWuwwKiBTpBZPCxO/phjyxWv",

		//异步通知地址
		'notify_url' => "http://api.taian-table.com/api/v1/alipay/pay_mweb_notify",
		
		//同步跳转
		'return_url' => "http://api.taian-table.com/api/v1/alipay/pay_mweb_return",

		//编码格式
		'charset' => "UTF-8",

		//签名方式
		'sign_type'=>"RSA",

		//支付宝网关
		'gatewayUrl' => "https://openapi.alipay.com/gateway.do",

		//支付宝公钥,查看地址：https://openhome.alipay.com/platform/keyManage.htm 对应APPID下的支付宝公钥。
		'alipay_public_key' => "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkrIvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsraprwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUrCmZYI/FCEa3/cNMW0QIDAQAB",
		
	
);