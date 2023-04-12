<?php

namespace App\Services;

use App\Models\Merchant;


class MerchantService
{
    private ImageService $imageService;
    private AddressService $addressService;

    public function __construct(ImageService $imageService, AddressService $addressService)
    {
        $this->imageService = $imageService;
        $this->addressService = $addressService;
    }

    public function store(array $data)
    {
        $merchant = new Merchant();
        $merchant->name = $data['name'];
        $merchant->identification = $data['nid'];
        $merchant->save();
        $this->addressService->store($merchant, $data);
        if (array_key_exists('image', $data) && $data['image']) {
            $this->imageService->store($merchant, $data['image']);
        }
    }

    public function getAll()
    {
        return Merchant::with(['address', 'image'])->paginate(10);
    }

    public function delete($id): void
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->delete();
    }
}
