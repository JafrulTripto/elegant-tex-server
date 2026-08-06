<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Ready Stock permissions, granted to SUDO and Admin on existing installs.
 */
return new class extends Migration
{
    private array $permissions = [
        'VIEW_STOCK' => 'Permission to view Ready Stock levels and history.',
        'MANAGE_STOCK' => 'Permission to add or adjust Ready Stock manually.',
        'RETURN_ORDER' => 'Permission to mark order lines as returned.',
        'PULL_FROM_STOCK' => 'Permission to fulfil an order line from Ready Stock.',
    ];

    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = Role::where('guard_name', 'api')->whereIn('name', ['SUDO', 'Admin'])->get();

        foreach ($this->permissions as $name => $description) {
            $permission = Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => 'api'],
                ['description' => $description]
            );
            $roles->each(fn (Role $role) => $role->givePermissionTo($permission));
        }
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Permission::where('guard_name', 'api')->whereIn('name', array_keys($this->permissions))->delete();
    }
};
