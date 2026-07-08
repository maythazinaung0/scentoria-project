<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'brand_id', 'scent_id', 'description', 
        'type', 'gender', 'season', 'image_url'
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class); // Or whatever your variant model name is
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function scent()
    {
        return $this->belongsTo(Scent::class);
    }

    // Many-to-Many Relationship with pivot attribute 'type'
    public function notes(): BelongsToMany
    {
        return $this->belongsToMany(Note::class, 'product_notes')
                    ->withPivot('type')
                    ->withTimestamps();
    }
}