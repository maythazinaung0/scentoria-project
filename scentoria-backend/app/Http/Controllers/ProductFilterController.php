<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Product;

class ProductFilterController extends Controller
{
    public function seasons()
    {
        return response()->json(
            collect(['Spring', 'Summer', 'Autumn', 'Winter'])
                ->map(fn ($s) => ['id' => strtolower($s), 'name' => $s])
                ->values()
        );
    }

    public function genders()
    {
        return response()->json(
            collect(['Male', 'Female', 'Unisex'])
                ->map(fn ($g) => ['id' => strtolower($g), 'name' => $g])
                ->values()
        );
    }

    // Real listing endpoint for the search modal — separate from
    // BrandController::search(), which requires ?q= and returns [] without it.
    public function brands()
    {
        return response()->json(
            Brand::select('id', 'name')->orderBy('name')->get()
        );
    }

    public function byBrand($id)
    {
        return response()->json(
            Product::with(['brand', 'scent'])->where('brand_id', $id)->get()
        );
    }

    public function byScent($id)
    {
        return response()->json(
            Product::with(['brand', 'scent'])->where('scent_id', $id)->get()
        );
    }

public function byNote($id)
{
    return response()->json(
        Product::with(['brand', 'scent'])
            ->whereHas('notes', fn ($q) => $q->where('notes.id', $id))
            ->get()
    );
}

    public function bySeason($value)
    {
        return response()->json(
            Product::with(['brand', 'scent'])->where('season', $value)->get()
        );
    }

    public function byGender($value)
    {
        return response()->json(
            Product::with(['brand', 'scent'])->where('gender', $value)->get()
        );
    }
}