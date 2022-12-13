<?php

namespace App\Exceptions;

use Exception;

class DuplicateMarketplaceException extends Exception
{
    public function render($request)
    {
        return response()->json(["message" => "Marketplace already exists!!!"],400);
    }
}
