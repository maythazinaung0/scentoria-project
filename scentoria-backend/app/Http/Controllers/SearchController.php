<?php
 
namespace App\Http\Controllers;
 
use App\Models\Product;
use Illuminate\Http\Request;
 
class SearchController extends Controller
{
   public function search(Request $request)
{
    $query = $request->input('q');
    if (!$query) return response()->json([]);
 
    $searchQuery = strtolower($query);
   
    $map = [
        'men' => 'male', 'guy' => 'male',
        'women' => 'female', 'lady' => 'female',
        'summer' => 'summer', 'winter' => 'winter',
        'spring' => 'spring', 'autumn' => 'autumn'
    ];
    $val = $map[$searchQuery] ?? $searchQuery;
 
    $products = Product::with(['brand', 'scent', 'notes.note'])
        ->where(function ($q) use ($query, $val) {
            $q->where('name', 'LIKE', "%{$query}%")
              ->orWhere('gender', '=', $val)
              ->orWhere('season', '=', $val);
        })
        ->orWhereHas('brand', function ($q) use ($query) {
            $q->where('name', 'LIKE', "%{$query}%");
        })
        ->orWhereHas('scent', function ($q) use ($query) {
            $q->where('name', 'LIKE', "%{$query}%");
        })
        ->orWhereHas('notes', function ($q) use ($query) {
    $q->where('name', 'LIKE', "%{$query}%");
})
        ->limit(10)
        ->get();
 
    return response()->json($products);
}
}
 