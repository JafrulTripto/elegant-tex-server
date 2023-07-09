<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
  private UserService $userService;

  public function __construct(UserService $userService)
  {

    $this->userService = $userService;
  }

  public function createRole($role): bool
  {
    Role::create($role);
    return true;
  }

  public function assignUserRole(array $userIds, string $role): bool
  {
    foreach ($userIds as $id) {
      $user = $this->userService->getUserFromId($id);
      $user->assignRole($role);
    }

    return true;
  }

  public function removeUserRole(array $userIds, string $role): bool
  {
    foreach ($userIds as $id) {
      $user = $this->userService->getUserFromId($id);
      $user->removeRole($role);
    }
    return true;
  }

  public function getAllRoles(): Collection
  {
    return Role::all(['id', 'name']);
  }

  public function deleteRole($roleId): bool
  {
    $role = Role::findById($roleId);
    $role->delete();
    return true;
  }

  public function givePermissionToRole(string $role, string $permission): void
  {

    $role = Role::findByName($role);
    $role->givePermissionTo($permission);
  }

  public function revokePermissionToRole(string $role, string $permission): void
  {
    $role = Role::findByName($role);
    $role->revokePermissionTo($permission);
  }

  public function getPermissionsOfRole(string $role): array
  {

    $role = Role::findByName($role);
    $permissions = Permission::all(['name', 'description'])->map(function ($item) {
      return [
        'name' => $item->name,
        'description' => $item->description
      ];
    })->toArray();
    $rolePermissions = $role->permissions()->get(['name'])->map(function ($item) {
      return $item->name;
    })->toArray();

    return $this->mapRolePermissions($permissions, $rolePermissions);

  }

  private function mapRolePermissions(array $permissions, array $rolePermissions): array
  {
    $rolePermissionsArray = [];
    foreach ($permissions as $permission) {
      if (in_array($permission['name'], $rolePermissions)) {
        $rolePermission = [
          "permission" => $permission['name'],
          "description" => $permission['description'],
          "value" => true
        ];
      } else {
        $rolePermission = [
          "permission" => $permission['name'],
          "description" => $permission['description'],
          "value" => false
        ];
      }

      $rolePermissionsArray[] = $rolePermission;
    }
    return $rolePermissionsArray;
  }
}
