<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      // Bumped to 1000 — complex queries ("show orders from Grihashree between Jan–Mar") can be long
      "message" => ["required", "string", "min:1", "max:1000"],
      "history" => ["nullable", "array", "max:20"],
      "history.*.role" => ["required", "string", "in:user,assistant"],
      "history.*.content" => ["required", "string", "max:2000"],
    ];
  }
}
