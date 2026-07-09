<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Brand;
use App\Models\ScentProfile;
use App\Models\Scent;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'brand_id', 'scent_id', 'scent_profile_id',
        'description', 'type', 'gender', 'season',
        'price_regular', 'image_url',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function scent()
    {
        return $this->belongsTo(Scent::class, 'scent_id');
    }

    public function scent_profile()
    {
        return $this->belongsTo(ScentProfile::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Many-to-Many Relationship with pivot attribute 'type'
    public function notes(): BelongsToMany
    {
        return $this->belongsToMany(Note::class, 'product_notes')
                    ->withPivot('type')
                    ->withTimestamps();
    }
}