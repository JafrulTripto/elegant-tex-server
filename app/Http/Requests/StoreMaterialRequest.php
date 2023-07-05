<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required',
            'materialImage.name' => 'required',
            'materialImage.ext' => 'required',
            'materialImage.path' => 'required',
            'materialImage.size' => 'required|integer',
        ];
    }

    public function validationData(): array
    {
        return $this->json()->all();
    }
}
