<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use App\Models\User;
use App\Support\StatusChangeAuthorizer;
use Mockery;
use PHPUnit\Framework\TestCase;

/**
 * Transition-scoped authorization logic (ADR 0004) — DB-free: the User's
 * hasPermissionTo() is stubbed, so this tests the umbrella-OR-target rule itself.
 */
class StatusChangeAuthorizerTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function userWith(array $permissions): User
    {
        $user = Mockery::mock(User::class);
        $user->shouldReceive('hasPermissionTo')
            ->andReturnUsing(fn ($name) => in_array($name, $permissions, true));
        return $user;
    }

    public function test_change_status_umbrella_can_set_any_status(): void
    {
        $user = $this->userWith(['CHANGE_STATUS']);
        foreach (OrderStatus::cases() as $status) {
            $this->assertTrue(StatusChangeAuthorizer::canSet($user, $status), $status->name);
        }
    }

    public function test_target_permission_allows_only_that_status(): void
    {
        $user = $this->userWith(['ORDER_IN_QA']);
        $this->assertTrue(StatusChangeAuthorizer::canSet($user, OrderStatus::QA));
        $this->assertFalse(StatusChangeAuthorizer::canSet($user, OrderStatus::READY));
        $this->assertFalse(StatusChangeAuthorizer::canSet($user, OrderStatus::DELIVERED));
    }

    public function test_no_relevant_permission_is_denied(): void
    {
        $user = $this->userWith(['VIEW_ORDERS']);
        $this->assertFalse(StatusChangeAuthorizer::canSet($user, OrderStatus::QA));
        // DRAFT has no target permission, so only CHANGE_STATUS could grant it.
        $this->assertFalse(StatusChangeAuthorizer::canSet($user, OrderStatus::DRAFT));
    }
}
