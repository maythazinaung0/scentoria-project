<?php

namespace Database\Seeders;

use App\Models\Scent;
use Illuminate\Database\Seeder;

class ScentSeeder extends Seeder
{
    public function run(): void
    {
        $scents = [
            [
                'name' => 'Oud',
                'description' => 'A deep, resinous, and smoky scent family built around agarwood — rich, warm, and long-lasting.',
                'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601',
            ],
            [
                'name' => 'Fougère',
                'description' => 'A classic aromatic family built on lavender, oakmoss, and coumarin — herbal, fresh, and slightly sweet.',
                'image_url' => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539',
            ],
            [
                'name' => 'Floral',
                'description' => 'A bouquet-driven family centered on flower notes like rose, jasmine, and lily — soft, romantic, and elegant.',
                'image_url' => 'https://images.unsplash.com/photo-1615368144592-f7995089d5a2',
            ],