<?php

namespace App\Http\Requests;

use App\Rules\NoFullWidthCharacters;
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
        $scentId = $this->route('scent');

        return [
            'name' => ['required', 'string', 'max:100', new NoFullWidthCharacters, Rule::unique('scents', 'name')->ignore($scentId)],
            'description' => ['required', 'string', 'min:10','max:500', new NoFullWidthCharacters],
            'image_url' => ['nullable', 'url', 'max:255', new NoFullWidthCharacters],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Please enter a scent name.',
            'name.max'             => 'The scent name may not be greater than 100 characters.',
            'name.unique'          => 'A scent with this name already exists.',

            'description.required' => 'Please enter a description.',

            'image_url.url'        => 'The image URL must be a valid URL.',
            'image_url.max'        => 'The image URL may not be greater than 255 characters.',
        ];
    }
}