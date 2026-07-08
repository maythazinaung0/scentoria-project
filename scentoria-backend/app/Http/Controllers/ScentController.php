<?php
namespace App\Http\Controllers;
use App\Models\Scent;
use Illuminate\Http\Request;



class ScentController extends Controller
{
    public function index() {
        return response()->json(Scent::all());
    }


public function show(Scent $scent)
{
    return response()->json($scent);
}
}

