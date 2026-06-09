<?php

namespace App\Enums;

enum OrderStatus: int
{
  case DRAFT = 1;
  case APPROVED = 2;
  case PRODUCTION = 3;
  case QA = 4;
  case READY = 5;
  case DELIVERED = 6;
  case RETURNED = 7;
  case CANCELLED = 8;
  case BOOKING = 9;

  public static function tryFromName(string $name): ?self
  {
    foreach (self::cases() as $case) {
      if ($case->name === $name) {
        return $case;
      }
    }
    return null;
  }
}
