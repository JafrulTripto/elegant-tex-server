<?php

namespace App\Support;

use App\Enums\OrderStatus;
use App\Models\User;

/**
 * Transition-scoped status authorization (ADR 0004): a user may move an order
 * into status X if they hold the umbrella CHANGE_STATUS, or the target-status
 * permission for X. The single seam shared by updateOrderStatus and cancelOrder.
 */
class StatusChangeAuthorizer
{
    public static function canSet(User $user, OrderStatus $status): bool
    {
        if ($user->hasPermissionTo('CHANGE_STATUS')) {
            return true;
        }

        $permission = $status->requiredPermission();

        return $permission !== null && $user->hasPermissionTo($permission);
    }
}
