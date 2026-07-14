<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ReviewRequest;

class ReviewController extends Controller
{
    // GET /products/{product}/reviews — public list
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

    // POST /products/{product}/reviews — create the user's review
    // We type-hint ReviewRequest here to trigger your custom validation rules
    public function store(ReviewRequest $request, $productId)
    {
        // $request->validated() now uses the rules from ReviewRequest automatically
        $validated = $request->validated();

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $productId, // Assuming this is passed from the URL
            'rating'     => $validated['rating'],
            'comment'    => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Review Posting Success',
            'review' => $review
        ], 201);
    }

    // PUT /reviews/{review}
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You do not own this review.');
        }

        // Using manual validation here as requested (keeping your update logic consistent)
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000', 
        ]);

        $review->update($validated);
        return response()->json($review);
    }

    // DELETE /reviews/{review}
    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You do not own this review.');
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted.']);
    }
}