<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
       
        $productId = $this->route('id');

        return [
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'brand_id' => 'required|exists:brands,id',
            'scent_id' => 'required|exists:scents,id',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'gender' => 'required|string',
            'season' => 'required|string',
            'image_url' => 'nullable|url',

            'variants' => 'required|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.size' => 'required|string',
            'variants.*.original_price' => 'required|numeric',
            'variants.*.sale_price' => 'required|numeric',
            'variants.*.stock_quantity' => 'required|integer',
            'variants.*.sku' => 'nullable|string',

            'top_notes' => 'nullable|array',
            'top_notes.*' => 'exists:notes,id',
            'heart_notes' => 'nullable|array',
            'heart_notes.*' => 'exists:notes,id',
            'base_notes' => 'nullable|array',
            'base_notes.*' => 'exists:notes,id',
        ];
    }
}