<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductNote extends Model
{
    // ဒီ function က notes.note ကို အလုပ်လုပ်စေမှာပါ
    public function note() 
    {
        // note_id ဆိုတာ note table ကို ချိတ်ထားတဲ့ column name ဖြစ်ရပါမယ်
        return $this->belongsTo(Note::class, 'note_id'); 
    }
}