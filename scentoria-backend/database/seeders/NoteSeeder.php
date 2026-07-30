<?php

namespace Database\Seeders;

use App\Models\Note;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    public function run(): void
    {
        $notes = [
            ['name' => 'Cinnamon', 'icon_url' => 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70'],
            ['name' => 'Jasmine', 'icon_url' => 'https://images.unsplash.com/photo-1567696911980-2eed69a46042'],
            ['name' => 'Sandalwood', 'icon_url' => 'https://images.unsplash.com/photo-1620293023555-3a3f3b3f3a1a'],
            ['name' => 'Lemon', 'icon_url' => 'https://images.unsplash.com/photo-1590502593747-42a996133562'],
            ['name' => 'Water Lily', 'icon_url' => 'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d'],
            ['name' => 'Vanilla', 'icon_url' => 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c'],
            ['name' => 'Rose', 'icon_url' => 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7'],
            ['name' => 'Orange', 'icon_url' => 'https://images.unsplash.com/photo-1547514701-42782101795e'],
            ['name' => 'Saffron', 'icon_url' => 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7'],
        ];

        foreach ($notes as $note) {
            Note::firstOrCreate(
                ['name' => $note['name']],
                ['icon_url' => $note['icon_url']]
            );
        }
    }
}