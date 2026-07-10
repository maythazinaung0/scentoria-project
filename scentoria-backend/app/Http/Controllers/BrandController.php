<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     * This will be called by your SearchModal via /api/brands
     */
    public function index()
    {
        try {
            // Fetch brands. Since there is no image, we only select id and name.
            // We include image_url as null so your React frontend doesn't break.
            $brands = Brand::select('id', 'name')
                           ->orderBy('name', 'asc')
                           ->get()
                           ->map(function ($brand) {
                               $brand->image_url = null; // Ensure this property exists for React
                               return $brand;
                           });

            return response()->json($brands, 200);

        } catch (\Exception $e) {
            Log::error("BrandController Index Error: " . $e->getMessage());
            return response()->json(['message' => 'Error retrieving brands'], 500);
        }
    }
}