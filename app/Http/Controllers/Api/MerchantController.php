<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use App\Models\Merchant;
use App\Services\MerchantService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MerchantController extends Controller
{
    private MerchantService $merchantService;

    public function __construct(MerchantService $merchantService)
    {
        $this->middleware('auth:api', ['except' => ['login']]);
        $this->merchantService = $merchantService;
    }

    public function index()
    {
        $merchants = $this->merchantService->getAll();
        return response()->json($merchants);
    }

    public function store(Request $request)
    {
        $data = [
            'name'=> $request->name,
            'nid'=> $request->nid,
            'phone'=> $request->phone,
            'address'=> $request->address,
            'district'=> $request->district,
            'division'=> $request->division,
            'image'=> $request->image,
        ];
        $this->merchantService->store($data);
        return response()->json([
            "message" => "User created successfully."
        ]);
    }

    public function getAllMerchants() : ResourceCollection
    {
        return MerchantResource::collection(Merchant::all());
    }
}
