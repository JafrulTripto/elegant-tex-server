<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Services\IStorageService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{
    private IStorageService $storageService;
    public function __construct(StorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    public function upload(Request $request): array
    {
        $path = '/public/images/users';
        $userImage = $request->file("userImage");
        return $this->storageService->store($userImage, $path);
    }

    public function uploadProductImage(Request $request): array
    {
        $path = '/public/images/product';
        $productImage = $request->file("orderImage");
        return $this->storageService->store($productImage, $path);
    }
    public function uploadMerchantImage(Request $request): array
    {
        $path = '/public/images/merchant';
        $productImage = $request->file("merchantImage");
        return $this->storageService->store($productImage, $path);
    }

    public function getImage($imageId)
    {
        $image = Image::findOrFail($imageId);
        return Storage::disk('s3')->response($image->path);
    }

    public function destroy(Request $request)
    {
        $imagePath = $request->imagePath;
        $this->storageService->destroy($imagePath);
        return response()->json([
            "message" => "Image deleted successfully."
        ]);
    }
}
