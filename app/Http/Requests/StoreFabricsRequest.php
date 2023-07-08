<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFabricsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required',
            'fabricsImage.name' => 'required',
            'fabricsImage.ext' => 'required',
            'fabricsImage.path' => 'required',
            'fabricsImage.size' => 'required|integer',
        ];
    }

    public function validationData(): array
    {
        return $this->json()->all();
    }
}
