<?php
namespace App\Http\Controllers;
use App\Models\Scent;
use Illuminate\Http\Request;
use App\Http\Requests\ScentRequest;
use Illuminate\Http\JsonResponse;


class ScentController extends Controller
{
    public function index() {
        return response()->json(Scent::all());
    }


public function show(Scent $scent)
{
    return response()->json($scent);
}

public function store(ScentRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $scent = Scent::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'image_url' => $validatedData['image_url'] ?? null, 
        ]);

        return response()->json([
            'message' => 'Scent created successfully!',
            'data' => $scent
        ], 201); 
    }
}

