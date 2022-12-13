<?php

namespace App\Enums;

enum OrderStatus : int {
    case DRAFT = 0;
    case APPROVED = 1;
    case IN_PRODUCTION = 2;
    case IN_QA = 3;
}

