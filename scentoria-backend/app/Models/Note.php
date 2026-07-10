<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    public function productNotes() {
        return $this->hasMany(ProductNote::class, 'note_id');
    }
}