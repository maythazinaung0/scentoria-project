<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\WalletTopup;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\StoreWalletTopupRequest;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        return response()->json([
            'id'             => $request->user()->id,
            'name'           => $request->user()->name,
            'email'          => $request->user()->email,
            'phone_number'   => $request->user()->phone_number,
            'address'        => $request->user()->address,
            'wallet_balance' => $request->user()->wallet_balance,
        ]);
    }

    /**
     * Fetch Admin Payment Targets dynamically for the frontend UI.
     * Put your real QR code images inside public/images/payments/
     */
    public function getAdminPaymentMethods()
    {
        return response()->json([
            'kbzpay' => [
                'account_number' => '09123456789',
                'account_name'   => 'Scentoria Admin',
                'qr_code_url'    => asset('images/payments/kbz_qr.png')
            ],
            'cbpay' => [
                'account_number' => '09987654321',
                'account_name'   => 'Scentoria Admin',
                'qr_code_url'    => asset('images/payments/cb_qr.png')
            ]
        ]);
    }

    public function getOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::with(['items.variant.product.brand'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) use ($user) {
                return [
                    'id'             => $order->id,
                    'status'         => $order->status,
                    'total_amount'   => (int) $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'created_at'     => $order->created_at,
                    'address'        => $user->address,
                    'shipping_name'  => $user->name,
                    'shipping_phone' => $user->phone_number,
                    'items'          => $order->items->map(function ($item) {
                        return [
                            'id'           => $item->id,
                            'product_name' => $item->variant->product->name ?? 'Product',
                            'brand_name'   => $item->variant->product->brand->name ?? 'Generic',
                            'variant_size' => $item->variant->size ?? 'Standard',
                            'quantity'     => (int) $item->quantity,
                            'price'        => (int) $item->price,
                        ];
                    }),
                ];
            });

        return response()->json($orders);
    }

    public function getWalletTopups(Request $request)
    {
        $topups = WalletTopup::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($topups);
    }

    /**
     * Secure Top-up Submission Logic
     * Validates required user-facing manual info and acts against screenshot duplication frauds.
     */
      public function storeWalletTopup(StoreWalletTopupRequest $request) 
{
    
    $user = $request->user();

    // Flood mitigation barrier (max 3 pending)
    $pendingCount = WalletTopup::where('user_id', $user->id)->where('status', 'pending')->count();
    if ($pendingCount >= 3) {
        return response()->json(['message' => 'You already have 3 pending top-up requests awaiting review.'], 422);
    }

    $file = $request->file('transaction_image');
    $hash = hash_file('sha256', $file->getRealPath());

    if (WalletTopup::where('image_hash', $hash)->exists()) {
        return response()->json(['message' => 'This transaction screenshot has already been submitted.'], 422);
    }


    $path = $file->store('topups', 'public');

    $topup = WalletTopup::create([
        'user_id'               => $user->id,
        'deposit_amount'        => $request->input('deposit_amount'),
        'topup_channel'         => $request->input('topup_channel'),
        'sender_name'           => $request->input('sender_name'),
        'image_hash'            => $hash,
        'status'                => 'pending',
        'transaction_image_url' => $request->getSchemeAndHttpHost() . '/storage/' . $path,
    ]);

    return response()->json(['message' => 'Top-up request submitted successfully.', 'data' => $topup], 201);
}

  public function getReviews(Request $request)
{
    $reviews = DB::table('reviews')
        ->join('products', 'reviews.product_id', '=', 'products.id')
        ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->where('reviews.user_id', $request->user()->id)
        ->select(
            'reviews.*',
            'products.id as product_id',
            'products.name as product_name',
            'products.slug as product_slug',
            'products.image_url as product_image',
            'brands.name as brand_name'
        )
        ->orderBy('reviews.created_at', 'desc')
        ->get();

    return response()->json($reviews);
}

public function getWishlists(Request $request)
{
    $wishlists = DB::table('wishlists')
        ->join('products', 'wishlists.product_id', '=', 'products.id')
        ->where('wishlists.user_id', $request->user()->id)
        ->select(
            'wishlists.*',
            'products.name as product_name',
            'products.slug as product_slug',
            'products.image_url as product_image',
            'products.type as product_type'
        )
        ->orderBy('wishlists.created_at', 'desc')
        ->get();

    return response()->json($wishlists);
}

   public function changePassword(ChangePasswordRequest $request)
{
    $request->user()->update([
        'password' => Hash::make($request->new_password),
    ]);

    return response()->json(['message' => 'Password changed successfully.']);
}

    public function cancelOrder(Request $request, Order $order)
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            abort(403, 'You do not own this order.');
        }

        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json([
                'message' => 'This order can no longer be cancelled.'
            ], 422);
        }

        return DB::transaction(function () use ($order, $user) {
            $user = DB::table('users')->where('id', $user->id)->lockForUpdate()->first();

            $order->update(['status' => 'cancelled']);

            if ($order->payment_method === 'virtual_currency') {
                $newBalance = $user->wallet_balance + $order->total_amount;

                DB::table('users')->where('id', $user->id)->update([
                    'wallet_balance' => $newBalance,
                ]);

                WalletTransaction::create([
                    'user_id'                   => $user->id,
                    'type'                      => 'refund',
                    'order_id'                  => $order->id,
                    'direction'                 => 'credit',
                    'amount'                    => $order->total_amount,
                    'balance_after_transaction' => $newBalance,
                ]);
            }

            return response()->json([
                'message' => 'Order cancelled successfully.',
                'order'   => $order->fresh(),
            ]);
        });
    }

    public function storeWishlist(Request $request)
{
    $validated = $request->validate(['product_id' => 'required|exists:products,id']);

    $wishlist = DB::table('wishlists')
        ->where('user_id', $request->user()->id)
        ->where('product_id', $validated['product_id'])
        ->first();

    if ($wishlist) {
        return response()->json($wishlist, 200); // already wishlisted, idempotent
    }

    $id = DB::table('wishlists')->insertGetId([
        'user_id' => $request->user()->id,
        'product_id' => $validated['product_id'],
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json(['id' => $id, 'product_id' => $validated['product_id']], 201);
}

public function destroyWishlist(Request $request, $wishlistId)
{
    $deleted = DB::table('wishlists')
        ->where('id', $wishlistId)
        ->where('user_id', $request->user()->id)
        ->delete();

    if (!$deleted) {
        return response()->json(['message' => 'Wishlist item not found.'], 404);
    }

    return response()->json(['message' => 'Removed from wishlist.']);
}
}