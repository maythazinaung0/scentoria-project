<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    

    // Ensure this matches your database table name (e.g., 'brands')
    protected $table = 'brands'; 
    protected $fillable = ['name'];

}
