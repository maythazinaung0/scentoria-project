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
            'name' => 'required|string|max:255|min:2',
            'slug' => [
                'required',
                'string',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'brand_id' => 'required|exists:brands,id',
            'scent_id' => 'required|exists:scents,id',
 
            'description' => 'required|string|min:10',
            'type' => 'required|string',
            'gender' => 'required|string',
            'season' => 'required|string',
            'image_url' => 'nullable|url',

            'variants' => 'required|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.size' => 'required|string',
            'variants.*.original_price' => 'required|numeric|min:100|max:50000000',
           
            'variants.*.sale_price' => 'required|numeric|min:100|max:50000000|gte:variants.*.original_price',
            'variants.*.stock_quantity' => 'required|integer|min:0|max:10000',
            'variants.*.sku' => 'nullable|string',

            'top_notes' => 'required|array|min:1',
            'top_notes.*' => 'exists:notes,id',
            'heart_notes' => 'required|array|min:1',
            'heart_notes.*' => 'exists:notes,id',
            'base_notes' => 'required|array|min:1',
            'base_notes.*' => 'exists:notes,id',
        ];
    }
}