<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProductColorController;
use App\Http\Controllers\Api\ProductFabricController;
use App\Http\Controllers\Api\ProductTypeController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StorageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BangladeshGeocodeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {

    $user = $request->user();
    $roles = $user->roles()->pluck('name');
    $userPermissions = [];
    foreach ($roles->toArray() as $value) {
        $role = Role::findByName($value);
        $permissions = $role->permissions()->pluck('name')->toArray();
        $userPermissions = array_unique(array_merge($permissions,$userPermissions), SORT_REGULAR);

    }

    $image = $user->image;
    $res = [
        "user" => $user,
        "roles" => $roles,
        "image" => $image,
        "permissions" => $userPermissions
    ];
    return response()->json($res);
});
Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});
Route::group([
    'prefix' => 'users',
    'middleware' => 'auth:sanctum',
], function () {
    Route::post('/store', [UserController::class, 'store']);
    Route::get('/index', [UserController::class, 'index']);
    Route::get('/delete', [UserController::class, 'destroy']);
    Route::get('/getRoleUsers', [UserController::class, 'getRoleUsers']);
});
Route::prefix('files')->group(function () {
    Route::post('/upload', [StorageController::class, 'upload']);
    Route::post('/uploadProductImage', [StorageController::class, 'uploadProductImage']);
    Route::post('/uploadMerchantImage', [StorageController::class, 'uploadMerchantImage']);
    Route::get('/upload/{userId}', [StorageController::class, 'getImage']);
    Route::post('/delete', [StorageController::class, 'destroy']);
});

Route::prefix('settings/marketplace')->group(function () {
    Route::post('/store', [MarketplaceController::class, 'store']);
    Route::post('/index', [MarketplaceController::class, 'index']);
    Route::get('/getUserMarketplaces', [MarketplaceController::class, 'getUserMarketplaces']);
});

Route::group([
    'middleware' => ['auth:sanctum','permission:CREATE_MARKETPLACE_ORDER'],
    'prefix' => 'orders'
], function ($router) {

    Route::post('/store', [OrderController::class, 'store']);
    Route::get('/index', [OrderController::class, 'index']);
    Route::get('/getMarketplaceOrders/{userId}', [OrderController::class, 'getMarketplaceOrders']);
    Route::get('/getMerchantOrders', [OrderController::class, 'getMerchantOrders']);
    Route::get('/getOrder/{orderID}', [OrderController::class, 'getOrder']);
    Route::get('/getMerchants', [OrderController::class, 'getAllMerchants']);
    Route::get('/delete', [OrderController::class, 'destroy']);

});

Route::group([
    'middleware' => ['auth:sanctum','permission:CREATE_MERCHANT_ORDER'],
    'prefix' => 'merchants'
], function ($router) {
    Route::get('/index', [MerchantController::class, 'index']);
    Route::get('/getMerchants', [MerchantController::class, 'getAllMerchants']);
    Route::post('/store', [MerchantController::class, 'store']);

});

Route::group([
    'middleware' => 'auth:sanctum',
    'prefix' => 'settings'
], function ($router) {

    Route::get('/getRoles', [RoleController::class, 'getAll']);
    Route::post('/createRole', [RoleController::class, 'store']);
    Route::post('/assign', [RoleController::class, 'assign']);

});

//Route::prefix('settings')->group(function () {
//    Route::get('/getRoles', [RoleController::class, 'getAll']);
//    Route::post('/createRole', [RoleController::class, 'store']);
//    Route::post('/assign', [RoleController::class, 'assign']);
//
//});
Route::group([
    'middleware' => 'auth:sanctum',
    'prefix' => 'roles'
], function ($router) {

    Route::post('/assignRole', [RoleController::class, 'assignRoles']);
    Route::post('/removeRole', [RoleController::class, 'removeRoles']);
    Route::get('/deleteRole', [RoleController::class, 'destroy']);
    Route::post('/givePermissionToRole', [RoleController::class, 'givePermission']);
    Route::post('/revokePermissionToRole', [RoleController::class, 'revokePermission']);
    Route::get('/getRolePermissions', [RoleController::class, 'getRolePermissions']);

});



Route::group([
    'middleware' => 'auth:sanctum',
    'prefix' => 'permissions'
],function () {
    Route::get('/getPermissions', [PermissionController::class, 'getAll']);
    Route::post('/createPermission', [PermissionController::class, 'store']);
    Route::post('/checkPermission', [PermissionController::class, 'check']);
});

Route::prefix('settings/colors')->group(function () {
    Route::get('/index', [ProductColorController::class, 'index']);
    Route::post('/store', [ProductColorController::class, 'store']);
    Route::put('/update', [ProductColorController::class, 'update']);
    Route::get('/delete', [ProductColorController::class, 'destroy']);
});

Route::prefix('settings/fabrics')->group(function () {
    Route::get('/index', [ProductFabricController::class, 'index']);
    Route::post('/store', [ProductFabricController::class, 'store']);
    Route::post('/update', [ProductFabricController::class, 'update']);
    Route::get('/delete', [ProductFabricController::class, 'destroy']);
});
Route::prefix('settings/productTypes')->group(function () {
    Route::get('/index', [ProductTypeController::class, 'index']);
    Route::post('/store', [ProductTypeController::class, 'store']);
    Route::post('/update', [ProductTypeController::class, 'update']);
    Route::get('/delete', [ProductTypeController::class, 'destroy']);
});

Route::get('/getDivisions', [BangladeshGeocodeController::class, 'getDivision']);
Route::get('/getDistrictsByDivision', [BangladeshGeocodeController::class, 'getDistrictByDivision']);
Route::get('/getUpazilasByDistrict', [BangladeshGeocodeController::class, 'getUpazilasByDistrict']);
Route::get('/getUnionsByUpazila', [BangladeshGeocodeController::class, 'getUnionsByUpazila']);
