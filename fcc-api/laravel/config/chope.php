<?php

return [
	/**
	 * Base url for api call
	 * https://chopeapi.chope.co/ ​ (Production)
	 * http://chopeapi.chope.info/ ​ (Sandbox)
	 */
	'endpoint_base' => env('CHOPE_API_URL',  'http://chopeapi.sam.Chope.info/'),

	'restaurant_id' => env('CHOPE_RESTAURANT_ID',  'fccworld_restaurant_uid'),

	'token' => env('CHOPE_API_TOKEN',  '7728e362e1ad7cddef4a8f53c4770e3ccad16cf3'),
];
