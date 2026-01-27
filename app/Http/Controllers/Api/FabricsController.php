<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFabricsRequest;
use App\Models\Fabrics;
use App\Models\Product;
use App\Services\FabricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class FabricsController extends Controller
{
    private FabricsService $fabricsService;
    public function __construct(FabricsService $fabricsService)
    {
        $this->fabricsService = $fabricsService;
    }

    public function index()
    {
        $query = Fabrics::with('image');

        if (request()->has('search')) {
            $search = request('search');
            $query->where('name', 'LIKE', "%{$search}%");
        }

        return $query->paginate(20);
    }

    /**
     * @throws \Exception
     */
    public function store(StoreFabricsRequest $request): Fabrics
    {
        return $this->fabricsService->storeFabrics($request->validated());
    }

    public function destroy($id): JsonResponse
    {
        return $this->fabricsService->deleteFabrics($id);
    }
}
