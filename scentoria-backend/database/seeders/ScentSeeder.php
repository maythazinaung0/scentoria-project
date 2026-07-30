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
            ],
            [
                'name' => 'Fougère',
                'description' => 'A classic aromatic family built on lavender, oakmoss, and coumarin — herbal, fresh, and slightly sweet.',
            ],
            [
                'name' => 'Floral',
                'description' => 'A bouquet-driven family centered on flower notes like rose, jasmine, and lily — soft, romantic, and elegant.',
            ],
            [
                'name' => 'Woody',
                'description' => 'A warm, grounding family built on notes like sandalwood, cedar, and vetiver — earthy and enduring.',
            ],
            [
                'name' => 'Fresh',
                'description' => 'A crisp, clean family drawing on citrus, green, and aquatic notes — light and invigorating.',
            ],
            [
                'name' => 'Amber',
                'description' => 'A warm, resinous, slightly sweet family built on labdanum, vanilla, and balsamic notes.',
            ],
            [
                'name' => 'Musk',
                'description' => 'A soft, skin-like family known for its subtle, sensual, and long-lasting base character.',
            ],
        ];

        foreach ($scents as $scent) {
            Scent::firstOrCreate(
                ['name' => $scent['name']],
                ['description' => $scent['description']]
            );
        }
    }
}