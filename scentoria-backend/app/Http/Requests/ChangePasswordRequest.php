<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth:sanctum middleware already gates this route
    }

    public function rules(): array
    {
        return [
            // 'current_password' is a built-in Laravel rule — it checks the
            // value against the authenticated user's actual password, so we
            // don't need Hash::check() by hand in the controller anymore.
            'current_password' => ['required', 'current_password'],

            'new_password' => [
                'required',
                'confirmed', // requires new_password_confirmation to match
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.current_password' => 'The current password you entered is incorrect.',
            'new_password.confirmed' => 'New password and confirmation do not match.',
        ];
    }
}