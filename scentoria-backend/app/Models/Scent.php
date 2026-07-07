<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ScentProfile;
use App\Models\Scent;
use App\Models\Product;

class Scent extends Model
{
    //protected $table = 'scents'; // သင့် database table နာမည်နဲ့ ကိုက်ညီပါစေ

    public function products()
    {
        return $this->hasMany(Product::class, 'scent_id');
    }
}
