<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{

    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function login()
    {
        $credentials = request(['email', 'password']);

        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $user = auth()->user();
        $user->last_login = now();
        $user->save();
        return $this->respondWithToken($token);
    }

//    public function login(LoginRequest $request)
//    {
//        $credentials = $request->validated();
//        if (!Auth::attempt($credentials)) {
//            return response([
//                "message" => 'Incorrect email or password!!!',
//            ], 422);
//        }
//        /** @var User $user */
//        $user = Auth::user();
//        $token = $user->createToken('main')->plainTextToken;
//        $user->last_login = now();
//        $user->save();
//        return response(compact('user', 'token'));
//    }

//    public function logout(Request $request)
//    {
//        $user = $request->user();
//        /** @var User $user */
//        $user->currentAccessToken()->delete();
//        return response('', 204);
//    }

    public function logout(): JsonResponse
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(): JsonResponse
    {
        $user = auth()->user();
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
    }

    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth()->refresh());
    }

    protected function respondWithToken($token): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }

    public function resetPasword()
    {

    }
}
