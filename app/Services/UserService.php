<?php

namespace App\Services;

use App\Exceptions\UserAdminException;
use App\Models\User;
use App\Notifications\WelcomeEmailNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserService
{
    private AddressService $addressService;
    private ImageService $imageService;
    private StorageService $storageService;

    public function __construct(AddressService $addressService, ImageService $imageService, StorageService $storageService)
    {
        $this->addressService = $addressService;
        $this->imageService = $imageService;
        $this->storageService = $storageService;
    }

    /**
     * @throws \Exception
     */
    public function store(array $userData): void
    {

        try {
            $user = User::create([
                'firstname' => $userData['firstName'],
                'lastname' => $userData['lastName'],
                'email' => $userData['email'],
                'nid' => $userData['nid'],
                'password' => Hash::make($userData['password']),
            ]);

            $this->addressService->store($user, $userData);

            if (array_key_exists('image', $userData) && !empty($userData['image'])) {
                $this->imageService->store($user, $userData['image']);
            }
            $user->notify(new WelcomeEmailNotification());
        } catch (\Exception $e) {
            Log::error('Failed to create user: ' . $e->getMessage());
            throw new \Exception('Failed to create user');
        }
    }

    public function getAll()
    {
        return User::with(['address', 'image'])->paginate(10);
    }

    public function getRoleUsers()
    {
        $users = User::get(['id', 'firstname', 'lastname'])->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->firstname.' '.$user->lastname,
                'roles' => $user->getRoleNames()
            ];
        });
        return $users;
    }



    public function delete(string $userId): bool
    {
        try {
            $user = User::findOrFail($userId);
            if ($user->hasRole(['SUDO', 'Admin'])){
                throw new UserAdminException("Cannot delete admin user.");
            }
        } catch (QueryException $exception) {
            throw new HttpResponseException(response()->json([
                'message' => $exception->getMessage(),
                'status' => $exception->getCode()
            ], 500));
        }
        $userImagePath = $user->imagePath();
        if ($userImagePath) {
            $imageDeleted = $this->storageService->destroy($userImagePath);
            if ($imageDeleted) {
                $user->image()->delete();
                $user->address()->delete();
                $user->delete();
                return true;
            }
        } else {
            $user->address()->delete();
            $user->delete();
            return true;
        }
        return false;
    }


    public function getUserFromId ($userId) : User {
        return User::where('id', $userId)->first();
    }

}
