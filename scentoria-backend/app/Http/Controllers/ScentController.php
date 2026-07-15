<?php

namespace App\Http\Controllers;

use App\Models\Scent;
use Illuminate\Http\Request;
use App\Http\Requests\ScentRequest;
use Illuminate\Http\JsonResponse;

class ScentController extends Controller
{
    public function index()
    {
        $scents = Scent::all()->map(function ($scent) {
            $data = $scent->toArray();
            $data['common_notes'] = $scent->commonNotes(4)->pluck('name');
            return $data;
        });

        return response()->json($scents);
    }

    public function show($id)
    {
        $scent = Scent::with(['products' => function ($q) {
            $q->where('status', 'active')->with(['brand', 'variants']);
        }])->find($id);

        if (!$scent) {
            return response()->json(['message' => 'Scent not found'], 404);
        }

        $scentData = $scent->toArray();
        $scentData['common_notes'] = $scent->commonNotes()->pluck('name');

        return response()->json($scentData);
    }

    public function store(ScentRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $scent = Scent::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'image_url' => $validatedData['image_url'] ?? null,
        ]);

        return response()->json($scent, 201);
    }

    public function update(ScentRequest $request, $id): JsonResponse
    {
        $scent = Scent::findOrFail($id);
        $validatedData = $request->validated();

        $scent->update([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'image_url' => $validatedData['image_url'] ?? null,
        ]);

        return response()->json($scent);
    }

   public function destroy($id)
{
    $scent = Scent::findOrFail($id);

    if ($scent->products()->exists()) {
        $count = $scent->products()->count();
        return response()->json([
            'message' => "This scent is used by {$count} product" . ($count === 1 ? '' : 's') . " and cannot be deleted. Reassign or remove those products first.",
        ], 422);
    }

    $scent->delete();
    return response()->json(['message' => 'Scent deleted successfully']);
}
}