<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function getAllPermissions(): Collection
    {
        return Permission::all(['id','name','description']);
    }
    public function createPermission($permission): bool
    {
        Permission::create($permission);
        return true;
    }
}
