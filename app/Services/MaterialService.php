<?php

namespace App\Services;

use App\Models\Material;
use Exception;
use Illuminate\Support\Facades\Log;


class MaterialService
{
    private ImageService $imageService;
    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * @throws Exception
     */
    public function storeMaterial($data): Material
    {
        try {
            $material = new Material();
            $material->name = $data['name'];;
            $material->save();

            $this->imageService->store($material, $data['materialImage']);
            return $material;
        } catch (Exception $e) {
            Log::error('Material storage error: ' . $e->getMessage());
            throw new Exception('Failed to store material', 500);
        }
    }
}
