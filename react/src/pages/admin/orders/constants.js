// Status badge colors + dropdown options for the Orders page
export const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};
 
// Used by the "Status" filter dropdown in the toolbar
export const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
 
// Used by the status changer inside the order detail modal
export const STATUS_UPDATE_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'];