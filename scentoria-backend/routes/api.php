<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScentController;
use App\Http\Controllers\ProductController; 
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;  
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;

// Public Routes 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/scents', [ScentController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);

// Auth Routes  
Route::middleware('auth:sanctum')->group(function () {
    
    // User Session
    Route::get('/me', fn (Request $request) => response()->json($request->user()));
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile & Reviews & Orders
    Route::get('/user/profile', [ProfileController::class, 'getProfile']);
    Route::get('/orders', [ProfileController::class, 'getOrders']);
    Route::get('/wallet-topups', [ProfileController::class, 'getWalletTopups']);
    Route::post('/wallet-topups', [ProfileController::class, 'storeWalletTopup']);
    Route::get('/reviews', [ProfileController::class, 'getReviews']);  

    // Cart Items  
    Route::get('/cart', [CartItemController::class, 'index']);
    Route::post('/cart', [CartItemController::class, 'store']);
    Route::delete('/cart/{id}', [CartItemController::class, 'destroy']); 

    // Checkout 
    Route::post('/orders', [CheckoutController::class, 'store']);

    // Order Confirm
    Route::get('/orders/{id}', [OrderController::class, 'show']);
}); 

// Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::post('/admin/login', [AuthController::class, 'login']);
    Route::post('/admin/logout', [AuthController::class, 'logout'])->middleware('auth:admin');
}); 