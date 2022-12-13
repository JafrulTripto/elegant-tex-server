<?php

namespace App\Enums;

enum OrderType: int {
    case MERCHANT = 0;
    case MARKETPLACE = 1;
}
