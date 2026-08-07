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

  /**
   * The permission required to move an order *into* this status, or null when
   * only the umbrella CHANGE_STATUS applies. Mapped by the target status — the
   * canonical source of truth for the transition-scoped model (ADR 0004).
   */
  public function requiredPermission(): ?string
  {
    return match ($this) {
      self::APPROVED   => 'ORDER_APPROVE',
      self::PRODUCTION => 'ORDER_IN_PRODUCTION',
      self::QA         => 'ORDER_IN_QA',
      self::READY      => 'ORDER_READY',
      self::DELIVERED  => 'ORDER_DELIVERED',
      self::RETURNED   => 'ORDER_RETURNED',
      self::CANCELLED  => 'ORDER_CANCELLED',
      self::BOOKING    => 'ORDER_BOOKING',
      self::DRAFT      => null,
    };
  }
}
