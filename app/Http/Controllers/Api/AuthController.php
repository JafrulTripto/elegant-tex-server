<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
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
        $userActive = User::where('email', $credentials['email'])->where('status', 1)->first();
        if (!$userActive) {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }
        if (! $token = auth()->attempt($credentials)) {
            return response()->json(['message' => 'Incorrect email or password.'], 401);
        }
        $user = auth()->user();
        $user->last_login = now();
        $user->save();
        return $this->respondWithToken($token);
    }

    public function logout(): JsonResponse
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(): JsonResponse
    {
        try {
            $user = auth()->user();
            $roles = $user->roles()->pluck('name');
            $userPermissions = [];

            foreach ($roles->toArray() as $value) {
                $role = Role::findByName($value);
                $permissions = $role->permissions->pluck('name')->toArray();
                $userPermissions = array_unique(array_merge($permissions, $userPermissions), SORT_REGULAR);
            }

            $image = $user->image;

            // Log information about the user and permissions
            Log::info('User details retrieved successfully.', ['user' => $user, 'permissions' => $userPermissions]);

            $res = [
                "user" => $user,
                "roles" => $roles,
                "image" => $image,
                "permissions" => $userPermissions
            ];

            return response()->json($res);
        } catch (\Exception $e) {
            // Log an error if an exception occurs
            Log::error('An error occurred in the "me" function: ' . $e->getMessage());
            // Handle the exception or return an error response
            return response()->json(['error' => 'An error occurred.'], 500);
        }
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

    public function resetPassword(ResetPasswordRequest $request)
    {
        // Retrieve user based on email address
        $user = User::where('email', $request->input('email'))->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (!Hash::check($request->input('currentPassword'), $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 401);
        }
        // Hash and save new password
        $user->password = Hash::make($request->input('password'));
        $user->save();
        return response()->json(['message' => 'Password reset successful. Please login again.']);
    }
}
