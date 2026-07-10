<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Brand;
use App\Models\ScentProfile;
use App\Models\Scent;
use App\Models\ProductVariant;
use App\Models\ProductNote;


class Product extends Model
{
    protected $fillable = [
        'name', 
        'brand_id', 
        'scent_id',
        'price_regular', 
        'image_url', 
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

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    
public function notes() 
{
    return $this->hasMany(ProductNote::class, 'product_id');
}

   
}