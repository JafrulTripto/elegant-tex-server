<?php

namespace App\Http\Requests;

use App\Exceptions\DuplicateEmailException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreUserRequest extends FormRequest
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
            'name' => 'required',
            'email' => 'required|unique:users|email',
            'password' => 'required',
        ];
    }

    /**
     * @throws DuplicateEmailException
     */
    public function failedValidation(Validator $validator)
    {
        throw new DuplicateEmailException();
    }
}
