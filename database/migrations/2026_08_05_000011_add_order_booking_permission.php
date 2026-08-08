<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * BOOKING is the one order status without a per-status permission, so it could
 * not be gated under the transition-scoped model (ADR 0004). Create it and grant
 * it to SUDO/Admin on existing installs, mirroring the other status permissions.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::firstOrCreate(
            ['name' => 'ORDER_BOOKING', 'guard_name' => 'api'],
            ['description' => 'Permission to Set the order status to BOOKING.']
        );

        Role::where('guard_name', 'api')
            ->whereIn('name', ['SUDO', 'Admin'])
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permission));
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Permission::where('name', 'ORDER_BOOKING')->where('guard_name', 'api')->delete();
    }
};
