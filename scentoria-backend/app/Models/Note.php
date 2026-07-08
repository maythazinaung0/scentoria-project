<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Note extends Model
{
    protected $fillable = ['name', 'icon_url'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_notes')
                    ->withPivot('type')
                    ->withTimestamps();
    }
}