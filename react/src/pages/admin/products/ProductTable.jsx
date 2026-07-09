import { Edit2, Trash2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Product list table (name, scent, type/gender, variant count, actions)
// ---------------------------------------------------------------------------
export default function ProductTable({ filtered, openEdit, handleDelete, deleting, onSelectProduct }) {
  return (
    <div className="bg-nature-card border border-nature-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left text-nature-muted text-xs px-5 py-4">PRODUCT</th>
            <th className="text-left text-nature-muted text-xs px-5 py-4 hidden lg:table-cell">SCENT</th>
            <th className="text-left text-nature-muted text-xs px-5 py-4">TYPE / GENDER</th>
            <th className="text-center text-nature-muted text-xs px-5 py-4">VARIANTS</th>
            <th className="px-5 py-4 w-20" />
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            // Clicking a row opens the detail modal; action buttons stop propagation so they don't also trigger it
            <tr key={p.id} onClick={() => onSelectProduct(p)} className="border-b border-nature-sand/30 last:border-0 hover:bg-nature-sage/10 cursor-pointer transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.image_url ?? 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=80'} alt={p.name} className="w-11 h-11 rounded-xl object-cover border" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-nature-muted text-xs">{p.brand?.name ?? 'Unknown Brand'}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 hidden lg:table-cell">{p.scent?.name ? <span className="bg-nature-sage/30 text-nature-olive px-2 py-0.5 rounded-full text-xs">{p.scent.name}</span> : '—'}</td>
              <td className="px-5 py-3 text-xs capitalize">{p.type} <span className="text-nature-muted">({p.gender})</span></td>
              <td className="px-5 py-3 text-center text-xs text-nature-muted">{p.variants?.length || 0} sizes</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={e => openEdit(p, e)} className="text-nature-muted hover:text-nature-olive p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => handleDelete(p.id, e)} disabled={deleting === p.id} className="text-nature-subtle hover:text-red-500 p-1 disabled:opacity-40"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}