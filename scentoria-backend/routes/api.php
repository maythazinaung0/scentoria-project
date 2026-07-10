<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScentController;
use App\Http\Controllers\ProductController; 
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\NoteController;

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', fn (Request $request) => response()->json($request->user()));
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::post('/admin/login', [AuthController::class, 'login']);
    Route::post('/admin/logout', [AuthController::class, 'logout'])->middleware('auth:admin');
});

// Search Route
Route::get('/search', [SearchController::class, 'search']);

// Navigation List Routes (For Modal Menus)
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/scents', [ScentController::class, 'index']);
Route::get('/notes', [NoteController::class, 'index']);
Route::get('/genders', [ProductController::class, 'getGenders']);
Route::get('/seasons', [ProductController::class, 'getSeasons']);

// Product Filter Routes (For fetching products by category ID/Type)
Route::get('/products-by-brand/{id}', [ProductController::class, 'byBrand']);
Route::get('/products-by-scent/{id}', [ProductController::class, 'byScent']);
Route::get('/products-by-note/{id}', [ProductController::class, 'byNote']);
Route::get('/products-by-gender/{type}', [ProductController::class, 'byGender']);
Route::get('/products-by-season/{type}', [ProductController::class, 'bySeason']);

// General Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/scents/{scent}', [ScentController::class, 'show']);