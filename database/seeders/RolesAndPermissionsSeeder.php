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
    Permission::create(['guard_name' => 'api', 'name' => 'CREATE_USER', 'description'=> 'Permission to create a new user.']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_USERS', 'description'=> 'Permission to view all the users.']);
    Permission::create(['guard_name' => 'api', 'name' => 'UPDATE_USER', 'description'=> 'Permission to update a user']);
    Permission::create(['guard_name' => 'api', 'name' => 'DELETE_USER', 'description'=> 'Permission to delete a user']);
    Permission::create(['guard_name' => 'api', 'name' => 'CREATE_MARKETPLACE_ORDER', 'description'=> 'Permission to create marketpalce orders.']);
    Permission::create(['guard_name' => 'api', 'name' => 'CREATE_MERCHANT_ORDER', 'description'=> 'Permission to merchant orders.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ROLE_SETTINGS', 'description'=> 'Permission to setup roles and give them permissions.']);
    Permission::create(['guard_name' => 'api', 'name' => 'PERMISSION_SETTINGS', 'description'=> 'Permission to access the permission settings.']);
    Permission::create(['guard_name' => 'api', 'name' => 'MARKETPLACE_SETTINGS', 'description'=> 'Permission to access marketplace settings']);
    Permission::create(['guard_name' => 'api', 'name' => 'PRODUCT_SETTINGS', 'description'=> 'Permission to access product settings.']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_MERCHANTS', 'description'=> 'Permission to access merchant settings. It includes also creating and deleting merchants.']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_ORDERS', 'description'=> 'Permission to access the orders module.']);
    Permission::create(['guard_name' => 'api', 'name' => 'DELETE_ORDER', 'description'=> 'Permission to delete an order.']);
    Permission::create(['guard_name' => 'api', 'name' => 'CHANGE_STATUS', 'description'=> 'With this permission an user can change an order status to any of the status form the list.']);
    Permission::create(['guard_name' => 'api', 'name' => 'CANCEL_ORDER', 'description'=> 'Permission to cancel an order.']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_SETTINGS', 'description'=> 'Permission to access settings module']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_ALL_ORDERS', 'description'=> 'Permission to view all the orders.']);
    Permission::create(['guard_name' => 'api', 'name' => 'VIEW_ALL_MARKETPLACES', 'description'=> 'Permission to view all the marketplaces.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_APPROVE', 'description'=> 'Permission to Set the order status to APPROVED.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_IN_PRODUCTION', 'description'=> 'Permission to Set the order status to PRODUCTION.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_IN_QA', 'description'=> 'Permission to Set the order status to QA.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_READY', 'description'=> 'Permission to Set the order status to READY.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_DELIVERED', 'description'=> 'Permission to Set the order status to DELIVERED.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_RETURNED', 'description'=> 'Permission to Set the order status to RETURNED.']);
    Permission::create(['guard_name' => 'api', 'name' => 'ORDER_CANCELLED', 'description'=> 'Permission to Set the order status to CANCELLED.']);


    // create roles and assign created permissions

    // this can be done as separate statements
    $role = Role::create(['guard_name' => 'api', 'name' => 'SUDO']);
    $role->givePermissionTo(Permission::all());

    $role = Role::create(['guard_name' => 'api', 'name' => 'Admin']);
    $role->givePermissionTo(Permission::all());
    $role->revokePermissionTo('PERMISSION_SETTINGS');
  }
}
