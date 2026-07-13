<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Note;
use App\Models\Product;

class Scent extends Model
{
    protected $fillable = ['name', 'description', 'image_url'];

    public function products()
    {
        return $this->hasMany(Product::class, 'scent_id');
    }

    /**
     * The notes most commonly used across this scent family's products —
     * computed live from real product data rather than hand-curated, so it
     * never drifts out of sync with what's actually in the catalogue.
     */
    public function commonNotes($limit = 8)
    {
        return Note::whereHas('products', function ($q) {
            $q->where('scent_id', $this->id);
        })
            ->withCount(['products' => function ($q) {
                $q->where('scent_id', $this->id);
            }])
            ->orderByDesc('products_count')
            ->limit($limit)
            ->get(['notes.id', 'notes.name', 'notes.icon_url']);
    }
}