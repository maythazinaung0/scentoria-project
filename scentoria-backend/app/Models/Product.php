<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Brand;
use App\Models\Scent;
use App\Models\ProductVariant;
use App\Models\Note;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'brand_id', 'scent_id', 'description',
        'type', 'gender', 'season', 'image_url', 'status'
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
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

    /**
     * True when every variant of this product is out of stock (or it has no variants at all).
     */
    public function isOutOfStock(): bool
    {
        return $this->variants()->sum('stock_quantity') <= 0;
    }

   
    public function refreshStockStatus(): self
    {
        $newStatus = $this->isOutOfStock() ? 'inactive' : 'active';

        if ($this->status !== $newStatus) {
            $this->status = $newStatus;
            $this->save();
        }

        return $this;
    }
}