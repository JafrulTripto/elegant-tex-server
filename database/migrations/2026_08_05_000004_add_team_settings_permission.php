<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Adds the TEAM_SETTINGS permission (manage teams and their members) and grants
 * it to the SUDO and Admin roles on existing installs.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::firstOrCreate(
            ['name' => 'TEAM_SETTINGS', 'guard_name' => 'api'],
            ['description' => 'Permission to manage teams and their members.']
        );

        Role::where('guard_name', 'api')
            ->whereIn('name', ['SUDO', 'Admin'])
            ->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permission));
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Permission::where('name', 'TEAM_SETTINGS')->where('guard_name', 'api')->delete();
    }
};
