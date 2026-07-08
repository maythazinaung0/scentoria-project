<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScentController;
use App\Http\Controllers\ProductController; 
use App\Http\Controllers\BrandController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

// Public Authentication Routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', fn (Request $request) => response()->json($request->user()));
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Public/User-facing Catalogue Data (Optional: keeping read-only actions accessible to users if needed)
    Route::get('/scents', [ScentController::class, 'index']);
});

// Protected Admin Management Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::post('/admin/login', [AuthController::class, 'login']);
    Route::post('/admin/logout', [AuthController::class, 'logout'])->middleware('auth:admin');

    // Protected Product Management
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Protected Brand Management
    Route::get('/brands', [BrandController::class, 'index']);
    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{id}', [BrandController::class, 'update']);
    Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

    // Fetch Master Olfactory Notes list for form drop-downs
    Route::get('/notes', function() {return response()->json(\App\Models\Note::all());});
    
    /* Future Order Management routes can be cleanly placed here:
       Route::get('/orders', [OrderController::class, 'index']);
       Route::put('/orders/{id}', [OrderController::class, 'update']);
    */
});