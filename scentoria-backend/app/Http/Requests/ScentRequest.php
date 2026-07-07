<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ScentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       $scentId = $this->route('scent')?->id;

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('scents', 'name')->ignore($scentId)],
            'description' => ['required', 'string'],
            'image_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
