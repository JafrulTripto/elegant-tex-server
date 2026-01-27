<?php

namespace App\Services;

use App\Exceptions\UserAdminException;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Hash;

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

    public function store(array $userData)
    {

        $user = new User();
        $user->firstname = $userData['firstName'];
        $user->lastname = $userData['lastName'];
        $user->email = $userData['email'];
        $user->nid = $userData['nid'];
        $user->password = Hash::make($userData['password']);
        $user->save();
        $this->addressService->store($user, $userData);
        if (array_key_exists('image', $userData) && !empty($userData['image'])) {
            $this->imageService->store($user, $userData['image']);
        }
    }

    public function update(User $user, array $userData)
    {
        $user->firstname = $userData['firstName'];
        $user->lastname = $userData['lastName'];
        $user->email = $userData['email'];
        $user->nid = $userData['nid'];
        
        if (isset($userData['password']) && !empty($userData['password'])) {
            $user->password = Hash::make($userData['password']);
        }
        
        $user->save();
        
        $this->addressService->update($user, $userData);
        
        if (array_key_exists('image', $userData) && !empty($userData['image'])) {
            // Delete old image if exists? Or ImageService handles it?
            // Usually ImageService::store might handle replacement or we just add a new one.
            // Let's assume store handles it or we need to check.  
            // Checking ImageService previously (not shown fully) but usually for polymorphic relations `morphOne` 
            // `store` might create a new one. 
            // Just to be safe, let's look at ImageService or just call store. 
            // Looking at `User.php`: `public function image() { return $this->morphOne(Image::class, 'imageable'); }`
            // If we call store, it might fail if one exists or create duplicate if not careful.
            // But let's check `delete` method in UserService uses `imagePath` and `storageService->destroy`.
            
            // For now, let's try to update. If image exists, maybe we should delete old one first if a NEW image is provided.
            if ($user->image()->exists()) {
                 $userImagePath = $user->imagePath();
                 $this->storageService->destroy($userImagePath);
                 $user->image()->delete();
            }
            $this->imageService->store($user, $userData['image']);
        }
        return $user;
    }

    public function getAll(array $filters = [])
    {
        $query = User::with(['address', 'image']);

        if (isset($filters['search']) && !empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('firstname', 'like', "%{$searchTerm}%")
                  ->orWhere('lastname', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('nid', 'like', "%{$searchTerm}%")
                  ->orWhereHas('address', function ($q) use ($searchTerm) {
                      $q->where('phone', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if (isset($filters['status']) && $filters['status'] !== null && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Check if the column is valid to prevent SQL injection or errors
        $allowedSorts = ['firstname', 'lastname', 'email', 'status', 'last_login', 'id'];
        if (in_array($sortBy, $allowedSorts)) {
             $query->orderBy($sortBy, $sortOrder);
        } else {
             $query->orderBy('id', 'desc');
        }

        return $query->paginate(10);
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
