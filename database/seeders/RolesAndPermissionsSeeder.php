<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;


class RolesAndPermissionsSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */

    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['guard_name' => 'api','name' => 'CREATE_USER']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_USERS']);
        Permission::create(['guard_name' => 'api','name' => 'UPDATE_USER']);
        Permission::create(['guard_name' => 'api','name' => 'DELETE_USER']);
        Permission::create(['guard_name' => 'api','name' => 'CREATE_MARKETPLACE_ORDER']);
        Permission::create(['guard_name' => 'api','name' => 'CREATE_MERCHANT_ORDER']);
        Permission::create(['guard_name' => 'api','name' => 'ROLE_SETTINGS']);
        Permission::create(['guard_name' => 'api','name' => 'PERMISSION_SETTINGS']);
        Permission::create(['guard_name' => 'api','name' => 'MARKETPLACE_SETTINGS']);
        Permission::create(['guard_name' => 'api','name' => 'PRODUCT_SETTINGS']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_MERCHANTS']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_ORDERS']);
        Permission::create(['guard_name' => 'api','name' => 'DELETE_ORDER']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_SETTINGS']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_ALL_ORDERS']);
        Permission::create(['guard_name' => 'api','name' => 'VIEW_ALL_MARKETPLACES']);


        // create roles and assign created permissions

        // this can be done as separate statements
        $role = Role::create(['guard_name' => 'api','name' => 'Admin']);
        $role->givePermissionTo('CREATE_USER');

        $role = Role::create(['guard_name' => 'api','name' => 'SUDO']);
        $role->givePermissionTo(Permission::all());
    }
}
