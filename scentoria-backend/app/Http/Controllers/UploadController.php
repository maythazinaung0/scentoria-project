<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'file.required' => 'Please select an image to upload.',
            'file.image'    => 'The file must be an image.',
            'file.mimes'    => 'The image must be a JPEG, PNG, or JPG file.',
            'file.max'      => 'The image must not be larger than 2MB.',
        ]);

        $path = $request->file('file')->store('uploads', 'public');

        return response()->json([
            'url' => $request->getSchemeAndHttpHost() . '/storage/' . $path,
        ]);
    }
}