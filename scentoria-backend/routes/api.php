<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\WalletTopUpController;
use App\Http\Controllers\OrderCompletionController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProductFilterController;

use Illuminate\Http\Request;

// Public routes (no auth needed)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/scents', [ScentController::class, 'index']);
Route::get('/notes',[NoteController::class,'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/scents/{scent}', [ScentController::class, 'show']);

Route::get('/brands', [BrandController::class, 'search']); // unchanged, needs ?q=
Route::get('/brands-list', [ProductFilterController::class, 'brands']);
Route::get('/seasons', [ProductFilterController::class, 'seasons']);
Route::get('/genders', [ProductFilterController::class, 'genders']);

Route::get('/products-by-brand/{id}',     [ProductFilterController::class, 'byBrand']);
Route::get('/products-by-scent/{id}',     [ProductFilterController::class, 'byScent']);
Route::get('/products-by-note/{id}',      [ProductFilterController::class, 'byNote']);
Route::get('/products-by-season/{value}', [ProductFilterController::class, 'bySeason']);
Route::get('/products-by-gender/{value}', [ProductFilterController::class, 'byGender']);

// Order completion — public, protected by signature instead of auth
Route::get('/orders/{order}/confirm-completion', [OrderCompletionController::class, 'show'])
    ->name('orders.confirm-completion')
    ->middleware('signed');

Route::post('/orders/{order}/complete', [OrderCompletionController::class, 'complete'])
    ->name('orders.complete');

    // reviews
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // User Profile
    Route::get('/me', fn (Request $request) => response()->json($request->user()));
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/wishlists', [ProfileController::class, 'getWishlists']);
    Route::post('/user/change-password', [ProfileController::class, 'changePassword']);
    Route::get('/user/profile', [ProfileController::class, 'getProfile']);
    Route::get('/orders', [ProfileController::class, 'getOrders']);
    Route::get('/wallet-topups', [ProfileController::class, 'getWalletTopups']);
    Route::post('/wallet-topups', [ProfileController::class, 'storeWalletTopup']);
    Route::get('/reviews', [ProfileController::class, 'getReviews']);

    // Cart Items
    Route::get('/cart', [CartItemController::class, 'index']);
    Route::post('/cart', [CartItemController::class, 'store']);
    Route::delete('/cart/{id}', [CartItemController::class, 'destroy']);
    Route::patch('/cart/{id}', [CartItemController::class, 'update']);

    // Checkout
    Route::post('/orders', [CheckoutController::class, 'store']);

    // Order Confirm
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // order cancel
    Route::put('/orders/{order}/cancel', [ProfileController::class, 'cancelOrder']);
    Route::get('/payment-methods', [ProfileController::class, 'getAdminPaymentMethods']);

    // review and wishlist
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::post('/wishlists', [ProfileController::class, 'storeWishlist']);
    Route::delete('/wishlists/{wishlist}', [ProfileController::class, 'destroyWishlist']);
});

// Admin Routes 
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::apiResource('/admin/scents', ScentController::class)->except(['show']);
    Route::apiResource('/admin/notes', NoteController::class)->except(['show']);
    Route::post('/admin/upload', [UploadController::class, 'store']);

    // topups
    Route::get('/admin/wallet-topups', [WalletTopUpController::class, 'index']);
    Route::put('/admin/wallet-topups/{walletTopup}', [WalletTopUpController::class, 'update']);

    // Products
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/admin/products', [ProductController::class, 'adminIndex']);
    Route::get('/admin/products/{id}', [ProductController::class, 'adminShow']);

    // Brands
    Route::get('/admin/brands', [BrandController::class, 'index']);
    Route::post('/admin/brands', [BrandController::class, 'store']);
    Route::put('/admin/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/admin/brands/{id}', [BrandController::class, 'destroy']);

     
    // Orders
    Route::get('/admin/orders', [OrderController::class, 'index']);
Route::patch('/admin/orders/{order}', [OrderController::class, 'update']);
    // sales report
    Route::get('/admin/sales-report', [SalesReportController::class, 'index']);
});