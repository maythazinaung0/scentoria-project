<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductNote extends Model
{
    public function product() {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function note() {
        return $this->belongsTo(Note::class, 'note_id');
    }
}