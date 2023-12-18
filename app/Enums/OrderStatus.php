<?php

namespace App\Enums;

enum OrderStatus : int {
    case DRAFT = 0;
    case APPROVED = 1;
    case PRODUCTION = 2;
    case QA = 3;
    case READY = 4;
    case DELIVERED = 5;
    case RETURNED = 6;
    case CANCELLED = 7;
    case BOOKING = 8;
}

