// Default/blank state for the Add/Edit Product form
export const EMPTY_FORM = {
  name: '', slug: '', brand_id: '', scent_id: '', description: '', type: 'perfume', gender: 'unisex', season: 'spring', image_url: '',
  variants: [], top_notes: [], heart_notes: [], base_notes: []
};

// The only bottle sizes a product variant can use
export const AVAILABLE_SIZES = ['30ml', '50ml', '100ml'];