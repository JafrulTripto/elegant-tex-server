<?php

namespace App\Enums;

enum StockMovementType: string
{
    case RETURN_IN = 'RETURN_IN';   // a sellable returned line entering stock
    case MANUAL_IN = 'MANUAL_IN';   // a manual addition
    case ADJUSTMENT = 'ADJUSTMENT'; // a manual correction (may be negative)
    case PULL_OUT = 'PULL_OUT';     // an order line fulfilled from stock
}
