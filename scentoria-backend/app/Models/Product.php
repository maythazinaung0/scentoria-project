<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
<<<<<<< HEAD
use App\Models\Brand;
use App\Models\ScentProfile;
use App\Models\Scent;
=======
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
>>>>>>> feat/adminproduct

class Product extends Model
{
    protected $fillable = [
<<<<<<< HEAD
        'name', 
        'brand_id', 
        'scent_id',
        'scent_profile_id', 
        'price_regular', 
        'image_url', 
    ];

=======
        'name', 'slug', 'brand_id', 'scent_id', 'description', 
        'type', 'gender', 'season', 'image_url'
    ];

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class); // Or whatever your variant model name is
    }

>>>>>>> feat/adminproduct
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

<<<<<<< HEAD
    // app/Models/Product.php

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

=======
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
>>>>>>> feat/adminproduct
}