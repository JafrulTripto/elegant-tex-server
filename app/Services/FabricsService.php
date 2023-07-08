<?php

namespace App\Services;

use App\Models\Fabrics;
use Exception;
use Illuminate\Support\Facades\Log;


class FabricsService
{
    private ImageService $imageService;
    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
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
}
