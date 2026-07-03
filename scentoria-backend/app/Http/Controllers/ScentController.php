<?php

namespace App\Http\Controllers;

use App\Models\Scent;
use Illuminate\Http\Request;

class ScentController extends Controller
{
   public function index()
{
    $scents = Scent::all();
    return response()->json($scents);
}
}