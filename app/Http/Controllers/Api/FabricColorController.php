<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFabricsRequest;
use App\Models\FabricColor;
use App\Services\FabricColorService;
use Illuminate\Http\JsonResponse;

class FabricColorController extends Controller
{
    private FabricColorService $fabricColorService;

    public function __construct(FabricColorService $fabricColorService)
    {
        $this->fabricColorService = $fabricColorService;
    }

    public function index()
    {
        $query = FabricColor::with('image');

        if (request()->has('search')) {
            $search = request('search');
            $query->where('name', 'LIKE', "%{$search}%");
        }

        return $query->paginate(20);
    }

    /**
     * @throws \Exception
     */
    public function store(StoreFabricsRequest $request): FabricColor
    {
        return $this->fabricColorService->storeFabricColor($request->validated());
    }

    public function destroy($id): JsonResponse
    {
        return $this->fabricColorService->deleteFabricColor($id);
    }
}
