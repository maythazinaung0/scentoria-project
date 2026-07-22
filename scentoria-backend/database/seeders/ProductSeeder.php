<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Note;
use App\Models\Product;
use App\Models\Scent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Cache of Brand/Scent/Note name => id, so we don't hit the DB
     * for every single lookup while building products below.
     */
    private array $brands = [];
    private array $scents = [];
    private array $notes = [];

    public function run(): void
    {
        $this->brands = Brand::pluck('id', 'name')->all();
        $this->scents = Scent::pluck('id', 'name')->all();
        $this->notes  = Note::pluck('id', 'name')->all();

        foreach ($this->products() as $data) {
            $this->createProduct($data);
        }
    }

    private function createProduct(array $data): void
    {
        $brandId = $this->brands[$data['brand']] ?? null;
        $scentId = $this->scents[$data['scent']] ?? null;

        if (!$brandId || !$scentId) {
            $this->command?->warn("Skipping \"{$data['name']}\" - brand \"{$data['brand']}\" or scent \"{$data['scent']}\" not found.");
            return;
        }

        $slug = Str::slug($data['brand'] . ' ' . $data['name']);

        $product = Product::firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $data['name'],
                'description' => $data['description'],
                'brand_id' => $brandId,
                'scent_id' => $scentId,
                'type' => $data['type'],
                'gender' => $data['gender'],
                'season' => $data['season'],
                'image_url' => $data['image_url'],
                'status' => $data['status'] ?? 'active',
            ]
        );

        // Skip re-seeding notes/variants if the product already existed.
        if (!$product->wasRecentlyCreated) {
            return;
        }

        $this->attachNotes($product, $data['notes'] ?? []);
        $this->createVariants($product, $data['variants'] ?? []);
    }

    /**
     * $notes shape: ['top' => ['Lemon', 'Orange'], 'heart' => ['Jasmine'], 'base' => ['Sandalwood']]
     */
    private function attachNotes(Product $product, array $notes): void
    {
        foreach ($notes as $type => $names) {
            foreach ($names as $name) {
                $noteId = $this->notes[$name] ?? null;
                if (!$noteId) {
                    $this->command?->warn("  Note \"{$name}\" not found - skipping.");
                    continue;
                }
                // Attach one at a time (not sync/attach-with-array) since the
                // same note can legitimately appear in more than one layer
                // (e.g. Sandalwood in both heart and base).
                $product->notes()->attach($noteId, ['type' => $type]);
            }
        }
    }

    /**
     * $variants shape: [['size' => '50ml', 'original_price' => 300000, 'sale_price' => 320000, 'stock_quantity' => 10], ...]
     */
    private function createVariants(Product $product, array $variants): void
    {
        foreach ($variants as $variant) {
            $product->variants()->create([
                'size' => $variant['size'],
                'original_price' => $variant['original_price'],
                'discounted_price' => $variant['discounted_price'] ?? null,
                'sale_price' => $variant['sale_price'],
                'stock_quantity' => $variant['stock_quantity'],
                'sku' => Str::slug($product->slug . ' ' . $variant['size']),
            ]);
        }
    }

    /**
     * The product catalog to seed. Add more entries here as needed.
     */
    private function products(): array
    {
        return [
            [
                'name' => 'Black Orchid',
                'brand' => 'Tom Ford',
                'scent' => 'Oud',
                'description' => 'A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids.',
                'type' => 'perfume',
                'gender' => 'unisex',
                'season' => 'winter',
                'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601',
                'status' => 'active',
                'notes' => [
                    'top' => ['Cinnamon'],
                    'heart' => ['Jasmine'],
                    'base' => ['Sandalwood'],
                ],
                'variants' => [
                    ['size' => '30ml', 'original_price' => 350000, 'sale_price' => 380000, 'stock_quantity' => 8],
                    ['size' => '50ml', 'original_price' => 550000, 'sale_price' => 590000, 'stock_quantity' => 6],
                ],
            ],
            [
                'name' => 'Libre',
                'brand' => 'Yves Saint Laurent (YSL)',
                'scent' => 'Fougère',
                'description' => 'A radically modern floral fougère, a bold statement of freedom with lavender and orange blossom.',
                'type' => 'perfume',
                'gender' => 'female',
                'season' => 'spring',
                'image_url' => 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539',
                'status' => 'active',
                'notes' => [
                    'top' => ['Lemon'],
                    'heart' => ['Jasmine', 'Water Lily'],
                    'base' => ['Vanilla'],
                ],
                'variants' => [
                    ['size' => '30ml', 'original_price' => 250000, 'sale_price' => 270000, 'stock_quantity' => 15],
                    ['size' => '100ml', 'original_price' => 450000, 'sale_price' => 480000, 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Bloom',
                'brand' => 'Gucci',
                'scent' => 'Floral',
                'description' => 'A rich white floral bouquet celebrating the beauty and diversity of femininity.',
                'type' => 'perfume',
                'gender' => 'female',
                'season' => 'summer',
                'image_url' => 'https://images.unsplash.com/photo-1615368144592-f7995089d5a2',
                'status' => 'active',
                'notes' => [
                    'top' => ['Rose'],
                    'heart' => ['Water Lily'],
                    'base' => ['Sandalwood'],
                ],
                'variants' => [
                    ['size' => '50ml', 'original_price' => 280000, 'sale_price' => 300000, 'stock_quantity' => 12],
                ],
            ],
            [
                'name' => "Terre d'Hermès",
                'brand' => 'Hermès',
                'scent' => 'Woody',
                'description' => 'A mineral and vegetal fragrance built around the elemental relationship between man and earth.',
                'type' => 'cologne',
                'gender' => 'male',
                'season' => 'fall',
                'image_url' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
                'status' => 'active',
                'notes' => [
                    'top' => ['Orange'],
                    'heart' => ['Cinnamon'],
                    'base' => ['Sandalwood'],
                ],
                'variants' => [
                    ['size' => '50ml', 'original_price' => 300000, 'sale_price' => 320000, 'stock_quantity' => 9],
                    ['size' => '100ml', 'original_price' => 480000, 'sale_price' => 510000, 'stock_quantity' => 7],
                ],
            ],
            [
                'name' => 'Philosykos',
                'brand' => 'Diptyque',
                'scent' => 'Fresh',
                'description' => 'A green, milky fig fragrance capturing a fig tree from leaf to bark to fruit.',
                'type' => 'perfume',
                'gender' => 'unisex',
                'season' => 'summer',
                'image_url' => 'https://images.unsplash.com/photo-1595425964072-4c8b3d19e6e5',
                'status' => 'active',
                'notes' => [
                    'top' => ['Lemon'],
                    'heart' => ['Jasmine'],
                    'base' => ['Sandalwood'],
                ],
                'variants' => [
                    ['size' => '30ml', 'original_price' => 260000, 'sale_price' => 280000, 'stock_quantity' => 10],
                ],
            ],
            [
                'name' => 'Interlude Man',
                'brand' => 'Amouage',
                'scent' => 'Amber',
                'description' => 'A dramatic, smoky composition of contrasts - incense and leather wrapped in warm amber.',
                'type' => 'perfume',
                'gender' => 'male',
                'season' => 'winter',
                'image_url' => 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d',
                'status' => 'active',
                'notes' => [
                    'top' => ['Cinnamon'],
                    'heart' => ['Saffron'],
                    'base' => ['Sandalwood', 'Vanilla'],
                ],
                'variants' => [
                    ['size' => '50ml', 'original_price' => 600000, 'sale_price' => 650000, 'stock_quantity' => 5],
                    ['size' => '100ml', 'original_price' => 950000, 'sale_price' => 1000000, 'stock_quantity' => 4],
                ],
            ],
            [
                'name' => 'Gypsy Water',
                'brand' => 'Byredo',
                'scent' => 'Woody',
                'description' => 'A free-spirited scent evoking bonfires under starlit sky with juniper, pine needles and vanilla.',
                'type' => 'perfume',
                'gender' => 'unisex',
                'season' => 'fall',
                'image_url' => 'https://images.unsplash.com/photo-1602928321679-560bb453f190',
                'status' => 'active',
                'notes' => [
                    'top' => ['Lemon'],
                    'heart' => ['Jasmine'],
                    'base' => ['Vanilla', 'Sandalwood'],
                ],
                'variants' => [
                    ['size' => '50ml', 'original_price' => 400000, 'sale_price' => 430000, 'stock_quantity' => 8],
                ],
            ],
            [
                'name' => 'Santal 33',
                'brand' => 'Le Labo',
                'scent' => 'Musk',
                'description' => 'An iconic woody, leathery scent built around rare Australian sandalwood.',
                'type' => 'perfume',
                'gender' => 'unisex',
                'season' => 'fall',
                'image_url' => 'https://images.unsplash.com/photo-1592842232655-e5f36b04a02c',
                'status' => 'active',
                'notes' => [
                    'top' => ['Cinnamon'],
                    'heart' => ['Sandalwood'],
                    'base' => ['Sandalwood'],
                ],
                'variants' => [
                    ['size' => '50ml', 'original_price' => 500000, 'sale_price' => 540000, 'stock_quantity' => 6],
                    ['size' => '100ml', 'original_price' => 800000, 'sale_price' => 850000, 'stock_quantity' => 3],
                ],
            ],
        ];
    }
}