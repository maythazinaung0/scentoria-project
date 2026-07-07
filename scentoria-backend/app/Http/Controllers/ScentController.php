<?php
namespace App\Http\Controllers;
use App\Models\Scent;
use Illuminate\Http\Request;



class ScentController extends Controller
{
    public function index() {
        return response()->json(Scent::all());
    }


public function show($id) 
{
    // 'products' relation ကိုပါ တစ်ခါတည်း load လုပ်လိုက်ပါ
    $scent = Scent::with('products')->find($id);

    if (!$scent) {
        return response()->json(['message' => 'Scent not found'], 404);
    }
    
    return response()->json($scent);
}
}

