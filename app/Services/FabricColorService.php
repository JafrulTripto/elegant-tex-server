<?php

namespace App\Services;

use App\Models\FabricColor;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\Log;

class FabricColorService
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
    public function storeFabricColor($data): FabricColor
    {
        try {
            $fabricColor = new FabricColor();
            $fabricColor->name = $data['name'];
            $fabricColor->save();

            $this->imageService->store($fabricColor, $data['fabricsImage']);
            return $fabricColor;
        } catch (Exception $e) {
            Log::error('Fabric color storage error: ' . $e->getMessage());
            throw new Exception('Failed to store fabric color', 500);
        }
    }

    public function deleteFabricColor($id): \Illuminate\Http\JsonResponse|bool
    {
        $fabricColor = FabricColor::find($id);

        if (!$fabricColor) {
            return response()->json([
                "message" => "Fabric color not found."
            ], 404);
        }

        $referencingProducts = Product::where('fabric_color_id', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete fabric color because it is already in use."
            ], 400);
        }

        $imagePath = $fabricColor->imagePath();
        if ($imagePath) {
            $imageDeleted = $this->storageService->destroy($imagePath);
            if ($imageDeleted) {
                $fabricColor->image()->delete();
                $fabricColor->delete();
            }
        } else {
            $fabricColor->delete();
        }

        return response()->json([
            "message" => "Fabric color deleted successfully."
        ]);
    }
}
