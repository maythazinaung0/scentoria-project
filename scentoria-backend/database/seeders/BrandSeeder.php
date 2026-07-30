<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            'Tom Ford',
            'Yves Saint Laurent (YSL)',
            'Gucci',
            'Hermès',
            'Diptyque',
            'Amouage',
            'Byredo',
            'Le Labo',
        ];

        foreach ($brands as $name) {
            Brand::firstOrCreate(['name' => $name]);
        }
    }
}