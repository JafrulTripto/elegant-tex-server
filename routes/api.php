<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryChannelController;
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

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('me', [AuthController::class, 'me']);
    Route::post('resetPassword', [AuthController::class, 'resetPassword']);
});
Route::group([
    'prefix' => 'users',
    'middleware' => 'api',
], function () {
    Route::post('/store', [UserController::class, 'store']);
    Route::get('/index', [UserController::class, 'index']);
    Route::get('/delete', [UserController::class, 'destroy']);
    Route::get('/getRoleUsers', [UserController::class, 'getRoleUsers']);
    Route::get('/user/{id}', [UserController::class, 'getUser']);
});
Route::group([
    'prefix' => 'settings/marketplace',
    'middleware' => 'auth:api',
], function () {
    Route::post('/store', [MarketplaceController::class, 'store']);
    Route::post('/index', [MarketplaceController::class, 'index']);
    Route::get('/getUserMarketplaces', [MarketplaceController::class, 'getUserMarketplaces']);
    Route::delete('/delete/{id}', [MarketplaceController::class, 'destroy']);
    Route::post('/update/{id}', [MarketplaceController::class, 'update']);
});
Route::prefix('files')->group(function () {
    Route::post('/upload', [StorageController::class, 'upload']);
    Route::post('/uploadProductImage', [StorageController::class, 'uploadProductImage']);
    Route::post('/uploadMerchantImage', [StorageController::class, 'uploadMerchantImage']);
    Route::get('/upload/{userId}', [StorageController::class, 'getImage']);
    Route::post('/delete', [StorageController::class, 'destroy']);
});


Route::group([
    'middleware' => 'auth:api',
    'prefix' => 'orders'
], function ($router) {
    Route::post('/store', [OrderController::class, 'store']);
    Route::get('/index', [OrderController::class, 'index']);
    Route::get('/getMarketplaceOrders/{userId}', [OrderController::class, 'getMarketplaceOrders']);
    Route::get('/getMerchantOrders', [OrderController::class, 'getMerchantOrders']);
    Route::get('/getOrder/{orderID}', [OrderController::class, 'getOrder']);
    Route::get('/getMerchants', [OrderController::class, 'getAllMerchants']);
    Route::delete('/delete/{id}', [OrderController::class, 'destroy']);
    Route::post('/changeOrderStatus', [OrderController::class, 'changeOrderStatus']);
    Route::put('/update/{orderId}',  [OrderController::class, 'update']);
});

Route::group([
    'middleware' => ['api','permission:VIEW_MERCHANTS'],
    'prefix' => 'merchants'
], function ($router) {
    Route::get('/index', [MerchantController::class, 'index']);
    Route::get('/getMerchants', [MerchantController::class, 'getAllMerchants']);
    Route::delete('/delete/{id}', [MerchantController::class, 'destroy']);
    Route::post('/store', [MerchantController::class, 'store']);

});

Route::group([
    'middleware' => 'api',
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
    'middleware' => 'api',
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
    'middleware' => 'api',
    'prefix' => 'dashboard'
],function () {
    Route::get('/getOrderCountToday', [DashboardController::class, 'getOrderCountToday']);
});

Route::group([
    'middleware' => 'api',
    'prefix' => 'permissions'
],function () {
    Route::get('/getPermissions', [PermissionController::class, 'getAll']);
    Route::post('/createPermission', [PermissionController::class, 'store']);
    Route::post('/checkPermission', [PermissionController::class, 'check']);
});

Route::prefix('settings/colors')->group(function () {
    Route::get('/index', [ProductColorController::class, 'index']);
    Route::post('/store', [ProductColorController::class, 'store']);
    Route::put('/update/{id}', [ProductColorController::class, 'update']);
    Route::delete('/delete/{id}', [ProductColorController::class, 'destroy']);
});

Route::prefix('settings/fabrics')->group(function () {
    Route::get('/index', [ProductFabricController::class, 'index']);
    Route::post('/store', [ProductFabricController::class, 'store']);
    Route::put('/update/{id}', [ProductFabricController::class, 'update']);
    Route::delete('/delete/{id}', [ProductFabricController::class, 'destroy']);
});
Route::prefix('settings/productTypes')->group(function () {
    Route::get('/index', [ProductTypeController::class, 'index']);
    Route::post('/store', [ProductTypeController::class, 'store']);
    Route::put('/update/{id}', [ProductTypeController::class, 'update']);
    Route::delete('/delete/{id}', [ProductTypeController::class, 'destroy']);
});
Route::prefix('settings/deliveryChannels')->group(function () {
    Route::get('/index', [DeliveryChannelController::class, 'index']);
    Route::post('/store', [DeliveryChannelController::class, 'store']);
    Route::put('/update/{id}', [DeliveryChannelController::class, 'update']);
    Route::delete('/delete/{id}', [DeliveryChannelController::class, 'destroy']);
});

Route::get('/getDivisions', [BangladeshGeocodeController::class, 'getDivision']);
Route::get('/getDistrictsByDivision', [BangladeshGeocodeController::class, 'getDistrictByDivision']);
Route::get('/getUpazilasByDistrict', [BangladeshGeocodeController::class, 'getUpazilasByDistrict']);
Route::get('/getUnionsByUpazila', [BangladeshGeocodeController::class, 'getUnionsByUpazila']);
