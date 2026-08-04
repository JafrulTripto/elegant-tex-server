<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * The frontend gates the edit-order action on an EDIT_ORDER permission and the
 * role-settings UI offers it, but it was never seeded — assigning it to a role
 * threw "There is no permission named EDIT_ORDER". Create it and grant it to
 * SUDO/Admin on existing installs.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::firstOrCreate(
            ['name' => 'EDIT_ORDER', 'guard_name' => 'api'],
            ['description' => 'Permission to edit an existing order.']
        );

        Role::where('guard_name', 'api')
            ->whereIn('name', ['SUDO', 'Admin'])
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permission));
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Permission::where('name', 'EDIT_ORDER')->where('guard_name', 'api')->delete();
    }
};
