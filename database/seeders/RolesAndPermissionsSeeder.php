<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Idempotent: safe to re-run. Some permissions (teams, stock) are also
     * created by migrations for existing installs, so we firstOrCreate here to
     * avoid PermissionAlreadyExists collisions.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'CREATE_USER' => 'Permission to create a new user.',
            'VIEW_USERS' => 'Permission to view all the users.',
            'UPDATE_USER' => 'Permission to update a user',
            'DELETE_USER' => 'Permission to delete a user',
            'CREATE_MARKETPLACE_ORDER' => 'Permission to create marketpalce orders.',
            'CREATE_MERCHANT_ORDER' => 'Permission to merchant orders.',
            'ROLE_SETTINGS' => 'Permission to setup roles and give them permissions.',
            'PERMISSION_SETTINGS' => 'Permission to access the permission settings.',
            'MARKETPLACE_SETTINGS' => 'Permission to access marketplace settings',
            'PRODUCT_SETTINGS' => 'Permission to access product settings.',
            'VIEW_MERCHANTS' => 'Permission to access merchant settings. It includes also creating and deleting merchants.',
            'VIEW_ORDERS' => 'Permission to access the orders module.',
            'DELETE_ORDER' => 'Permission to delete an order.',
            'EDIT_ORDER' => 'Permission to edit an existing order.',
            'CHANGE_STATUS' => 'With this permission an user can change an order status to any of the status form the list.',
            'CANCEL_ORDER' => 'Permission to cancel an order.',
            'VIEW_SETTINGS' => 'Permission to access settings module',
            'VIEW_ALL_ORDERS' => 'Permission to view all the orders.',
            'VIEW_ALL_MARKETPLACES' => 'Permission to view all the marketplaces.',
            'ORDER_APPROVE' => 'Permission to Set the order status to APPROVED.',
            'ORDER_IN_PRODUCTION' => 'Permission to Set the order status to PRODUCTION.',
            'ORDER_IN_QA' => 'Permission to Set the order status to QA.',
            'ORDER_READY' => 'Permission to Set the order status to READY.',
            'ORDER_DELIVERED' => 'Permission to Set the order status to DELIVERED.',
            'ORDER_RETURNED' => 'Permission to Set the order status to RETURNED.',
            'ORDER_CANCELLED' => 'Permission to Set the order status to CANCELLED.',
            'TEAM_SETTINGS' => 'Permission to manage teams and their members.',
            'VIEW_STOCK' => 'Permission to view Ready Stock levels and history.',
            'MANAGE_STOCK' => 'Permission to add or adjust Ready Stock manually.',
            'RETURN_ORDER' => 'Permission to mark order lines as returned.',
            'PULL_FROM_STOCK' => 'Permission to fulfil an order line from Ready Stock.',
        ];

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(
                ['guard_name' => 'api', 'name' => $name],
                ['description' => $description]
            );
        }

        // create roles and assign created permissions
        $sudo = Role::firstOrCreate(['guard_name' => 'api', 'name' => 'SUDO']);
        $sudo->givePermissionTo(Permission::all());

        $admin = Role::firstOrCreate(['guard_name' => 'api', 'name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());
        $admin->revokePermissionTo('PERMISSION_SETTINGS');
    }
}
