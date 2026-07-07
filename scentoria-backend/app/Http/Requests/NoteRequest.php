<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $noteId = $this->route('note')?->id;

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('notes', 'name')->ignore($noteId)],
            'icon_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}