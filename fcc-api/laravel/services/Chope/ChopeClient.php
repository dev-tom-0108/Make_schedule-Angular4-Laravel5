<?php

namespace Fcc\Chope;

use GuzzleHttp\Client as HttpClient;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7\Request;
use Brick\PhoneNumber\PhoneNumber;

class ChopeClient {
	private $http;
	private $defaultHeaders;

	public function __construct() {
		$this->http = new HttpClient();
		$this->defaultHeaders = [
			'Authorization' => 'Bearer ' . config('chope.token'),
			"content-type" => 'application/json'
		];
	}

	public function createBooking($bookingData){
		$response = $this->makeRequest('POST','bookings/create', $bookingData);

		$decodedContent = json_decode($response->getBody()->getContents());
		return $decodedContent->result;
	}

	public function updateBooking($data){
		$response = $this->makeRequest('POST','bookings/edit', $data);

		return json_decode($response->getBody()->getContents());
	}

	public function cancelBooking($data){
		$response = $this->makeRequest('POST','bookings/cancel', $data);

		return json_decode($response->getBody()->getContents());
	}

	private function prepareRequestData($data){
		if (isset($data['phone'])){
			$number = PhoneNumber::parse($data['phone']);
			$data['phone_cc'] = $number->getCountryCode();
			$data['mobile'] = $number->getNationalNumber();
			unset($data['phone']);
		}

		$requestData = array_merge([
			'restaurant_id' => config('chope.restaurant_id')
		], $data);

		return json_encode($requestData);
	}

	private function makeRequest($method, $requestPath, $data){
		try {
			return $this->http->send(new Request(
				$method,
				config('chope.endpoint_base') . $requestPath,
				$this->defaultHeaders,
				$this->prepareRequestData($data)
			));
		} catch (ClientException $e){
			preg_match_all("/(?<=\"msg\":\")(.*)(?=\"\})/", $e->getResponse()->getBody(), $matches);
			$msg = isset($matches[0][0]) ? $matches[0][0] : 'Sorry! Your request can not be processed. Please check back soon!';
			throw new ChopeResponseException($msg, $e->getCode());
		}
	}
}