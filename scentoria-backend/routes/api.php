<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/orders', [AdminController::class, 'orders']);
});