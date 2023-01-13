<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        //$this->middleware('auth:api', ['except' => ['login']]);
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $users = $this->userService->getAll();
        return response()->json($users);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreUserRequest $request, UserService $userService)
    {
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'nid' => $request->nid,
            'address' => $request->address,
            'phone' => $request->phone,
            'upazila' => $request->upazila,
            'district' => $request->district,
            'division' => $request->division,
            'image' => $request->image
        ];

        $this->userService->store($userData);
        return response()->json([
            "message" => "User created successfully."
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        $userId = $request->get('id');

        $userDeleted = $this->userService->delete($userId);
        if($userDeleted) {
            return response()->json([
                "message" => "User deleted successfully."
            ]);
        }
        return response()->json([
            "message" => "Error deleting user"
        ]);
    }

    public function getRoleUsers()
    {
        return $this->userService->getRoleUsers();
    }


}
