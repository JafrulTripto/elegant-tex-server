<?php

namespace App\Services;

use App\Models\Fabrics;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\Log;


class FabricsService
{
    private ImageService $imageService;
    private StorageService $storageService;
    public function __construct(ImageService $imageService, StorageService $storageService)
    {
        $this->imageService = $imageService;
        $this->storageService = $storageService;
    }

    /**
     * @throws Exception
     */
    public function storeFabrics($data): Fabrics
    {
        try {
            $fabrics= new Fabrics();
            $fabrics->name = $data['name'];;
            $fabrics->save();

            $this->imageService->store($fabrics, $data['fabricsImage']);
            return $fabrics;
        } catch (Exception $e) {
            Log::error('Fabrics storage error: ' . $e->getMessage());
            throw new Exception('Failed to store fabrics', 500);
        }
    }

    public function deleteFabrics($id): \Illuminate\Http\JsonResponse|bool
    {
        $fabric = Fabrics::find($id);

        if (!$fabric) {
            return response()->json([
                "message" => "Fabric not found."
            ], 404);
        }

        $referencingProducts = Product::where('fabrics_id', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete product color because this color is already in use."
            ], 400);
        }
        $userImagePath = $fabric->imagePath();
        if ($userImagePath) {
            $imageDeleted = $this->storageService->destroy($userImagePath);
            if ($imageDeleted) {
                $fabric->image()->delete();
                $fabric->delete();
            }
        } else {
            $fabric->delete();
        }
        return response()->json([
            "message" => "Fabric deleted successfully."
        ]);
    }
}
