<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialRequest;
use App\Models\Material;
use App\Services\MaterialService;
use Illuminate\Support\Collection;

class MaterialController extends Controller
{
    private MaterialService $materialService;
    public function __construct(MaterialService $materialService)
    {
        $this->materialService = $materialService;
    }

    public function index(): Collection
    {
        return Material::with('image')->get();
    }

    /**
     * @throws \Exception
     */
    public function store(StoreMaterialRequest $request): Material
    {
        return $this->materialService->storeMaterial($request->validated());
    }
}
