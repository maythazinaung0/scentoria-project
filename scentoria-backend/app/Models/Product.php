<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
// Add explicit imports for your relational tables
use App\Models\Brand;
use App\Models\Scent;
use App\Models\Note;
use App\Models\ProductVariant;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'brand_id', 'scent_id', 'description', 
        'type', 'gender', 'season', 'image_url'
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function scent(): BelongsTo
    {
        return $this->belongsTo(Scent::class, 'scent_id');
    }

    public function notes(): BelongsToMany
    {
        return $this->belongsToMany(Note::class, 'product_notes')
                    ->withPivot('type')
                    ->withTimestamps();
    }
}