<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    private RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function getAll(Request $request)
    {
        return $this->roleService->getAllRoles();
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $roleCreated = $this->roleService->createRole($data);
        if ($roleCreated){
            return response()->json([
                "message" => "Role created successfully."
            ]);
        }
        return response()->json([
            "message" => "Error creating role."
        ]);
    }
    public function assignRoles(Request $request)
    {
        $userIds = $request->input('userIds');
        $role = $request->input('role');
        $this->roleService->assignUserRole($userIds, $role);
    }

    public function removeRoles(Request $request)
    {
        $userIds = $request->input('userIds');
        $role = $request->input('role');
        $this->roleService->removeUserRole($userIds, $role);
    }

    public function destroy(Request $request): JsonResponse
    {
        $roleId = $request->get('roleId');
        $roleDeleted = $this->roleService->deleteRole($roleId);
        if ($roleDeleted){
            return response()->json([
                "message" => "Role deleted successfully."
            ]);
        }
        return response()->json([
            "message" => "Error deleting role."
        ]);
    }

    public function givePermission(Request $request): JsonResponse
    {
        $role = $request->input("role");
        $permission = $request->input("permission");
        $this->roleService->givePermissionToRole($role, $permission);
        return response()->json([
            "message" => 'Permission "'.$permission.  '" given successfully.'
        ]);
    }
    public function revokePermission(Request $request): JsonResponse
    {
        $role = $request->input("role");
        $permission = $request->input("permission");
        $this->roleService->revokePermissionToRole($role, $permission);
        return response()->json([
            "message" => 'Permission "'.$permission.  '" revoked successfully.'
        ]);
    }


    public function getRolePermissions(Request $request): array
    {
        $role = $request->input("role");
        return $this->roleService->getPermissionsOfRole($role);
    }
}
