<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoteRequest;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
  public function index()
    {
        return Note::orderBy('name')->get();
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
        $note->delete();
        return response()->json(null, 204);
    }
}
