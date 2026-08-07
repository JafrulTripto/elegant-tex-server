<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use PHPUnit\Framework\TestCase;

/**
 * The transition-scoped model (ADR 0004) hinges on this map being correct and by
 * *target* status. Pure enum test — no DB, no app boot.
 */
class OrderStatusPermissionTest extends TestCase
{
    public function test_each_status_maps_to_its_target_permission(): void
    {
        $this->assertNull(OrderStatus::DRAFT->requiredPermission());
        $this->assertSame('ORDER_APPROVE', OrderStatus::APPROVED->requiredPermission());
        $this->assertSame('ORDER_IN_PRODUCTION', OrderStatus::PRODUCTION->requiredPermission());
        $this->assertSame('ORDER_IN_QA', OrderStatus::QA->requiredPermission());
        $this->assertSame('ORDER_READY', OrderStatus::READY->requiredPermission());
        $this->assertSame('ORDER_DELIVERED', OrderStatus::DELIVERED->requiredPermission());
        $this->assertSame('ORDER_RETURNED', OrderStatus::RETURNED->requiredPermission());
        $this->assertSame('ORDER_CANCELLED', OrderStatus::CANCELLED->requiredPermission());
        $this->assertSame('ORDER_BOOKING', OrderStatus::BOOKING->requiredPermission());
    }

    public function test_every_status_is_covered(): void
    {
        foreach (OrderStatus::cases() as $status) {
            // requiredPermission() must not throw for any case (match is exhaustive).
            $permission = $status->requiredPermission();
            $this->assertTrue($permission === null || is_string($permission));
        }
    }
}
