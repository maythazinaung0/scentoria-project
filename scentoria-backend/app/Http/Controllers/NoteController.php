<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoteRequest;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index()
    {
        return Note::select('id', 'name', 'icon_url')
            ->orderBy('name')
            ->get();
    }

    public function store(NoteRequest $request)
    {
        $note = Note::create($request->validated());
        return response()->json($note, 201);
    }

    public function update(NoteRequest $request, Note $note)
    {
        $note->update($request->validated());
        return response()->json($note);
    }

    public function destroy(Note $note)
{
    if ($note->products()->exists()) {
        $count = $note->products()->count();
        return response()->json([
            'message' => "This note is used by {$count} product" . ($count === 1 ? '' : 's') . " and cannot be deleted. Remove it from those products first.",
        ], 422);
    }

    $note->delete();
    return response()->json(null, 204);
}
}