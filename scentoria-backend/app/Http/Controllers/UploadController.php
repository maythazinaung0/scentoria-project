<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:5120',
        ]);

        $path = $request->file('file')->store('uploads', 'public');

        return response()->json([
            
            'url' => $request->getSchemeAndHttpHost() . '/storage/' . $path,
        ]);
    }
}