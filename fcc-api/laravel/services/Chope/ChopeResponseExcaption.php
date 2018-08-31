<?php

namespace Fcc\Chope;

use Throwable;

class ChopeResponseException extends \Exception {
	public function __construct( $message = "", $code = 0, Throwable $previous = null ) {
		parent::__construct( $message, $code, $previous );
	}
}