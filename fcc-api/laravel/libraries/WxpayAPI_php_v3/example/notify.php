<?php
//require_once '../lib/WxPay.Api.php';
//require_once '../lib/WxPay.Notify.php';
require_once base_path().'/libraries/WxpayAPI_php_v3/lib/WxPay.Api.php';
require_once base_path().'/libraries/WxpayAPI_php_v3/lib/WxPay.Notify.php';

class PayNotifyCallBack extends WxPayNotify
{
	private $callback_class;
	private $callback_member;
	public function __construct($callback_class, $callback_member)
	{
		$this->callback_class = $callback_class;
		$this->callback_member = $callback_member;
	}

	//查询订单
	public function Queryorder($transaction_id)
	{
		$input = new WxPayOrderQuery();
		$input->SetTransaction_id($transaction_id);
		$result = WxPayApi::orderQuery($input);

		if(array_key_exists("return_code", $result)
			&& array_key_exists("result_code", $result)
			&& $result["return_code"] == "SUCCESS"
			&& $result["result_code"] == "SUCCESS")
		{
			return true;
		}
		return false;
	}
	
	//重写回调处理函数
	public function NotifyProcess($data, &$msg)
	{
		if(!array_key_exists("transaction_id", $data)){
			$msg = "输入参数不正确";
			return false;
		}
		//查询订单，判断订单真实性
		if(!$this->Queryorder($data["transaction_id"])){
			$msg = "订单查询失败";
			return false;
		}

		$callback_member = $this->callback_member;
		$this->callback_class->$callback_member($data);
		return true;
	}
}

