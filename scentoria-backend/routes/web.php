<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\ProductController;




Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');