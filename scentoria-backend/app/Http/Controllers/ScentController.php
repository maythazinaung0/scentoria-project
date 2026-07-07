<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScentRequest;
use App\Models\Scent;
use Illuminate\Http\Request;

class ScentController extends Controller
{
   public function index()
    {
        return Scent::orderBy('name')->get();
    }

    public function store(ScentRequest $request)
    {
        $scent = Scent::create($request->validated());
        return response()->json($scent, 201);
    }

    public function update(ScentRequest $request, Scent $scent)
    {
        $scent->update($request->validated());
        return response()->json($scent);
    }

    public function destroy(Scent $scent)
    {
        $scent->delete();
        return response()->json(null, 204);
    }
}