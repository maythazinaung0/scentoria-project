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
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller  
{   
    public function getProfile(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'wallet_balance' => $request->user()->wallet_balance,
        ]);
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

    public function getOrders(Request $request)
    {
    
        $orders = DB::table('orders')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($orders as $order) {
            $order->items = DB::table('order_items')
                ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
                ->join('products', 'product_variants.product_id', '=', 'products.id')
                ->join('brands', 'products.brand_id', '=', 'brands.id') 
                ->where('order_items.order_id', $order->id)
                ->select(
                    'order_items.*',
                    'products.name as product_name',
                    'brands.name as brand_name',
                    'product_variants.size as variant_size'
                )
                ->get();
        }

        return response()->json($orders);
    }
    
    public function getWishlists(Request $request)
    {
        $wishlists = DB::table('wishlists')
            ->join('products', 'wishlists.product_id', '=', 'products.id')
            ->where('wishlists.user_id', $request->user()->id)
            ->select('wishlists.*', 'products.name as product_name', 'products.image_url as product_image', 'products.type as product_type')
            ->orderBy('wishlists.created_at', 'desc')
            ->get();

        return response()->json($wishlists);
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

    public function changePassword(Request $request)
    {
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|string|min:6|confirmed',
    ]);

    $user = $request->user();

    // Check current password really match 
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'The provided current password does not match our records.'
        ], 422);
    }

    // Save new password 
    $user->update([
        'password' => Hash::make($request->new_password)
    ]);

    return response()->json([
        'message' => 'Password changed successfully.'
    ], 200);
    }

}