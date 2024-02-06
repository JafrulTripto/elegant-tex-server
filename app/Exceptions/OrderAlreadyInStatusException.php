<?php

namespace App\Exceptions;

use Exception;

class OrderAlreadyInStatusException extends Exception
{
    protected $message = 'Order is already in the specified status.';

    public function __construct($message = null)
    {
        if ($message !== null) {
            $this->message = $message;
        }

        parent::__construct($this->message);
    }
}
