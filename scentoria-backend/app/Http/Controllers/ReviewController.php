<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // GET /products/{product}/reviews — public list, anyone can view
    public function index($productId)
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('product_id', $productId)
            ->select('reviews.*', 'users.name as user_name')
            ->orderByDesc('reviews.created_at')
            ->get();

        return response()->json($reviews);
    }

    // POST /products/{product}/reviews — create the logged-in user's review
    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $productId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($review, 201);
    }

    // PUT /reviews/{review} — update your own review only
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You do not own this review.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update($validated);
        return response()->json($review);
    }

    // DELETE /reviews/{review} — delete your own review only
    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You do not own this review.');
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted.']);
    }
}