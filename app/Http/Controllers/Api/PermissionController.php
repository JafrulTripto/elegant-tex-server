<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    private PermissionService $permissionService;

    public function __construct(PermissionService $permissionRepository)
    {
        $this->permissionService = $permissionRepository;
    }
    public function getAll(Request $request): JsonResponse
    {
        $permissions = $this->permissionService->getAllPermissions()->toArray();
        return response()->json($permissions, 200);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $roleCreated = $this->permissionService->createPermission($data);
        if ($roleCreated){
            return response()->json([
                "message" => "New permission created successfully."
            ]);
        }
        return response()->json([
            "message" => "Error creating new permission!!!"
        ]);
    }

    public function check(Request $request)
    {

    }

    public function destroy($id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                "message" => "Permission not found.",
            ], 404);
        }

        $permissionDeleted = $permission->delete();

        if ($permissionDeleted) {
            return response()->json([
                "message" => "Permission deleted successfully.",
            ]);
        }

        return response()->json([
            "message" => "Error deleting permission.",
        ]);
    }
}
