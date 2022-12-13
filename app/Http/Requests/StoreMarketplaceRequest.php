<?php

namespace App\Http\Requests;

use App\Exceptions\DuplicateEmailException;
use App\Exceptions\DuplicateMarketplaceException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreMarketplaceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'name' => 'required|unique:marketplaces',
            'pageLink' => 'required|unique:marketplaces,page_link',
            'users' => 'required',
        ];
    }

    /**
     * @throws DuplicateMarketplaceException
     */
    public function failedValidation(Validator $validator)
    {
        throw new DuplicateMarketplaceException();
    }
}
