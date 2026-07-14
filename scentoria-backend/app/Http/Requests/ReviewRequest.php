<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            // Rating is mandatory
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            
            // Comment is optional (nullable), string, max 500 chars, 
            // and regex validation allowed if a comment is provided.
            'comment' => [
                'nullable', 
                'string', 
                'max:500', 
                'regex:/^[a-zA-Z0-9\s\p{Myanmar}.!?,\-\'\"\(\)]+$/u'
            ], 
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'rating.required'  => 'Please select a star rating.',
            'rating.integer'   => 'The rating must be a number.',
            'rating.min'       => 'You must give at least 1 star.',
            'rating.max'       => 'You can give a maximum of 5 stars.',
            
            'comment.string'   => 'The comment must be a text.',
            'comment.max'      => 'Your comment is too long (maximum 500 characters are allowed).',
            'comment.regex'    => 'The comment contains invalid characters.',
        ];
    }
}