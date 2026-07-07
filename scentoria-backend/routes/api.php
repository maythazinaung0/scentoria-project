<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\WalletTopUpController;
use Illuminate\Http\Request;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
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
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::apiResource('admin/scents', ScentController::class)->except(['show']);
    Route::apiResource('admin/notes', NoteController::class)->except(['show']);
    Route::post('/admin/upload', [UploadController::class, 'store']);
    Route::get('/admin/wallet-topups', [WalletTopUpController::class, 'index']);
    Route::put('/admin/wallet-topups/{walletTopup}', [WalletTopUpController::class, 'update']);
});

Route::get('/scents', [ScentController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);