<?php

namespace App\Exceptions;

use Exception;

class DuplicateEmailException extends Exception
{
    public function render($request)
    {
        return response()->json(["message" => "Email already exists!!!"],400);
    }
}
