<?php

namespace App\Http\Requests;

use App\Rules\NoFullWidthCharacters;
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
            'deposit_amount'        => 'required|integer|min:1000|max:10000000',
            'topup_channel'         => 'required|in:kbzpay,cbpay',
            'sender_name'           => ['required', 'string', 'regex:/^[a-zA-Z\s]+$/', 'max:255', new NoFullWidthCharacters],
            'transaction_image'     => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
    
    public function messages()
    {
        return [
            'deposit_amount.required' => 'Please enter the amount sent.',
            'deposit_amount.integer'  => 'The amount must be a valid number.',
            'deposit_amount.min'      => 'The amount sent must not be less than 1000 MMK',
            'deposit_amount.max'      => 'The amount sent must not be greater than 1,000,000,0 MMK.',

            'topup_channel.required'  => 'Please select a payment method.',
            'topup_channel.in'        => 'Please select a valid payment method.',

            'sender_name.required'    => 'Please enter the sender name.',
            'sender_name.regex'       => 'The sender name must contain only letters and spaces.',
            'sender_name.max'         => 'The sender name may not be greater than 255 characters.',

            'transaction_image.required' => 'Please upload a screenshot of your transaction.',
            'transaction_image.image'    => 'The file must be an image.',
            'transaction_image.mimes'    => 'The image must be a JPEG, PNG, or JPG file.',
            'transaction_image.max'      => 'The image must not be larger than 2MB.',
        ];
    }
}