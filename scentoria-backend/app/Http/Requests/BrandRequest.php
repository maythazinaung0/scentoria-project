<?php

namespace App\Http\Requests;

use App\Rules\NoFullWidthCharacters;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // gated by 'auth:sanctum' + 'admin' middleware on the route
    }

    /**
     * Trim stray whitespace before validating, so "  Chanel  " and
     * "Chanel" aren't treated as different / don't slip past min:2 checks.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            $this->merge(['name' => trim($this->name)]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Shared by both:
     *  - POST /admin/brands            (store)
     *  - PUT  /admin/brands/{id}       (update)
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $brandId = $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                new NoFullWidthCharacters,
                Rule::unique('brands', 'name')->ignore($brandId),
            ],
        ];
    }

    /**
     * Custom messages for the defined rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Brand name is required.',
            'name.string' => 'Brand name must be text.',
            'name.min' => 'Brand name must be at least :min characters.',
            'name.max' => 'Brand name may not be longer than :max characters.',
            'name.unique' => 'A brand with this name already exists.',
        ];
    }

    /**
     * Nicer field name for error messages ("Brand name" instead of "name").
     */
    public function attributes(): array
    {
        return [
            'name' => 'brand name',
        ];
    }
}