<?php

namespace App\Exceptions;

use Exception;

class UserAdminException extends Exception
{
    public function render($request)
    {
        return response()->json(["message" => "Cannot perform action. User is an admin."],400);
    }
}
