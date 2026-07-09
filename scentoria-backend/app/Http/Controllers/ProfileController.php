<?php

namespace App\Http\Controllers;  

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\WalletTopup;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;  
use Illuminate\Support\Facades\DB;  

class ProfileController extends Controller  
{   
    public function getProfile(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'phone_number'   => $request->user()->phone_number,
            'address'        => $request->user()->address,
            'wallet_balance' => $request->user()->wallet_balance,
        ]);
    }

    public function getOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function getWalletTopups(Request $request)
    {
        $topups = WalletTopup::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($topups);
    }

    public function storeWalletTopup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'deposit_amount' => 'required|integer|min:1000|max:10000000',
            'topup_channel' => 'required|in:kbzpay,cbpay',
            'transaction_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',  
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $imageUrl = null;

        if ($request->hasFile('transaction_image')) {
            $file = $request->file('transaction_image');
            $path = $file->store('topups', 'public'); 
            $imageUrl = Storage::url($path); 
        }

        $topup = WalletTopup::create([
            'user_id' => $request->user()->id,
            'deposit_amount' => $request->input('deposit_amount'),
            'topup_channel' => $request->input('topup_channel'),
            'status' => 'pending',
            'transaction_image_url' => $imageUrl,
        ]);

        return response()->json([
            'message' => 'Top-up request submitted successfully.',
            'data' => $topup
        ], 201);
    }  
 
    public function getReviews(Request $request)
    {
        $reviews = DB::table('reviews')
            ->join('products', 'reviews.product_id', '=', 'products.id')  
            ->where('reviews.user_id', $request->user()->id)
            ->select('reviews.*', 'products.name as product_name')
            ->orderBy('reviews.created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
}