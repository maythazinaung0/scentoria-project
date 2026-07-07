import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import api from '../../api';

function ScentModal({ scent, onClose, onSaved }) {
  const isEdit = Boolean(scent);
  const [name, setName] = useState(scent?.name || '');
  const [description, setDescription] = useState(scent?.description || '');
  const [imageUrl, setImageUrl] = useState(scent?.image_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name, description, image_url: imageUrl || null };
      const { data } = isEdit
        ? await api.put(`/admin/scents/${scent.id}`, payload)
        : await api.post('/admin/scents', payload);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(74,104,56,0.35)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-neutral-800">{isEdit ? 'Edit Scent' : 'New Scent Family'}</h2>
          <button onClick={onClose} className="text-nature-muted hover:text-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Floral, Woody, Oriental"
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the character of this scent family..."
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Image URL <span className="normal-case font-normal opacity-60">(optional)</span></label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            {imageUrl && (
              <div className="mt-3 w-full h-32 rounded-xl overflow-hidden border border-nature-border/60 bg-neutral-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          {error && <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-nature-muted hover:text-neutral-800 text-sm font-medium tracking-wide border border-nature-border/80 rounded-xl py-2.5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-nature-olive hover:bg-nature-olive/90 disabled:opacity-60 text-white text-sm font-medium tracking-wide rounded-xl py-2.5 transition-colors shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Scent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScentCard({ scent, onEdit, onDelete, deleting }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(74,104,56,0.25)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="relative h-40 w-full overflow-hidden">
        {scent.image_url && !imgError ? (
          <img
            src={scent.image_url}
            alt={scent.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
            <span className="font-serif text-4xl text-nature-olive/35">
              {scent.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-nature-olive text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
          Fragrance Family
        </p>
        <h3 className="font-serif text-xl text-neutral-800 mb-1.5">{scent.name}</h3>
        <p className="text-nature-muted text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {scent.description}
        </p>

        <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-nature-border/50">
          <button
            onClick={() => onEdit(scent)}
            className="flex items-center gap-1.5 text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(scent.id)}
            disabled={deleting}
            className="flex items-center gap-1.5 text-nature-muted hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScentManagement() {
  const [scents, setScents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScent, setEditingScent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

function fetchScents(signal) {
  if (!hasLoadedOnce) setLoading(true);
  api.get('/admin/scents', { signal })
    .then(({ data }) => {
      setScents(data);
      setHasLoadedOnce(true);
    })
    .catch((err) => {
      if (err.name !== 'CanceledError') console.error('Failed to load scents:', err);
    })
    .finally(() => setLoading(false));
}

  useEffect(() => {
    const controller = new AbortController();
    fetchScents(controller.signal);
    return () => controller.abort();
  }, []);

  function openCreate() {
    setEditingScent(null);
    setModalOpen(true);
  }

  function openEdit(scent) {
    setEditingScent(scent);
    setModalOpen(true);
  }

  function handleSaved(saved) {
    setScents((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev];
    });
    setModalOpen(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this scent family? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/scents/${id}`);
      setScents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete scent:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredScents = scents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-7xl mx-auto">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Scent Library</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {scents.length} {scents.length === 1 ? 'fragrance family' : 'fragrance families'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive/90 text-white text-xs font-medium tracking-wide transition-colors px-4 py-2.5 rounded-xl shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Scent
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nature-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scent families..."
              className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-nature-border/80 focus:border-nature-olive/60 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors placeholder-nature-muted/70"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredScents.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {search ? `No scent families match "${search}".` : 'No scent families yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredScents.map((scent) => (
                <ScentCard
                  key={scent.id}
                  scent={scent}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  deleting={deletingId === scent.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <ScentModal
          scent={editingScent}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}