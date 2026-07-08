<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ScentProfile;
use App\Models\Scent;
use App\Models\Product;

class Scent extends Model
{
    

 protected $table = 'scents';  
public function products()
{
    
    return $this->hasMany(\App\Models\Product::class, 'scent_id', 'id');
}
}
