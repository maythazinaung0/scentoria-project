<?php

namespace App\Http\Controllers;

use App\Models\Note;

class NoteController extends Controller
{
    public function index()
    {
        // Name နဲ့ Image_url ကို သေချာ ထည့်ပေးထားပါတယ်
        return Note::select('id', 'name', 'icon_url')->get();
    }
}