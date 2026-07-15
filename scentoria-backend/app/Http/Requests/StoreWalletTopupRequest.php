<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWalletTopupRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        return [
            'deposit_amount'        => 'required|integer|min:1000|max:1000000',
            'topup_channel'         => 'required|in:kbzpay,cbpay',
            'sender_name'           => 'required|string|regex:/^[a-zA-Z\s]+$/|max:255',
            'transaction_image'     => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
    
    public function messages()
    {
        return [
        'deposit_amount.required' => 'Please enter the amount sent.',
        'deposit_amount.integer'  => 'The amount must be a valid number.',
        'deposit_amount.min'      => 'The amount sent must not be less than 1000 MMK',
        'deposit_amount.max'      => 'The amount sent must not be greater than 1,000,000 MMK.',

        'sender_name.required'    => 'Please enter the sender name.',
        'sender_name.regex'       => 'The sender name must contain only letters and spaces.',
        'sender_name.max'         => 'The sender name may not be greater than 255 characters.',
            
        ];
    }
}