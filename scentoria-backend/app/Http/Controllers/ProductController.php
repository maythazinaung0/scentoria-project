<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        // Database ထဲက Product အားလုံးကို ယူပြီး JSON အနေနဲ့ ပြန်ပို့ပေးမယ်
        return Product::all();
    }
}