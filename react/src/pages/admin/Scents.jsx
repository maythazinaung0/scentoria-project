import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ImageOff, Search, Loader2 } from 'lucide-react';
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
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_50px_-10px_rgba(74,104,56,0.35)] p-6 animate-in fade-in zoom-in-95 duration-300">
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

export default function ScentManagement() {
  const [scents, setScents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScent, setEditingScent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function fetchScents() {
    setLoading(true);
    api.get('/admin/scents')
      .then(({ data }) => setScents(data))
      .catch((err) => console.error('Failed to load scents:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchScents();
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
      <style>{`
        @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-60px) scale(1.12); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,40px) scale(1.15); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) scale(0.98); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        .anim-blob-a { animation: floatA 25s ease-in-out infinite; background: radial-gradient(circle, rgba(74,104,56,0.12) 0%, rgba(255,255,255,0) 70%); }
        .anim-blob-b { animation: floatB 30s ease-in-out infinite; background: radial-gradient(circle, rgba(201,169,79,0.08) 0%, rgba(255,255,255,0) 70%); }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-7xl mx-auto">

          <div className="flex items-center justify-between fade-up">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Scent Library</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {scents.length} {scents.length === 1 ? 'fragrance family' : 'fragrance families'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="group flex items-center gap-2 bg-nature-olive hover:bg-nature-olive/90 text-white text-xs font-medium tracking-wide transition-all duration-500 px-4 py-2.5 rounded-xl shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)] hover:shadow-[0_8px_24px_-4px_rgba(74,104,56,0.6)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Scent
            </button>
          </div>

          <div className="fade-up relative" style={{ animationDelay: '80ms' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nature-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scent families..."
              className="w-full max-w-sm bg-white/40 backdrop-blur-md border border-white/50 focus:border-nature-olive/40 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors placeholder-nature-muted/70"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredScents.length === 0 ? (
            <div className="fade-up bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {search ? `No scent families match "${search}".` : 'No scent families yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredScents.map((scent, i) => (
                <div
                  key={scent.id}
                  className="fade-up group relative bg-white/20 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-10px_rgba(74,104,56,0.4)] hover:-translate-y-1.5 transition-all duration-500"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="h-36 w-full bg-gradient-to-br from-nature-olive/10 to-neutral-100 flex items-center justify-center overflow-hidden">
                    {scent.image_url ? (
                      <img src={scent.image_url} alt={scent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageOff className="w-6 h-6 text-nature-muted/50" />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-lg text-neutral-800 mb-1.5">{scent.name}</h3>
                    <p className="text-nature-muted text-xs leading-relaxed line-clamp-2">{scent.description}</p>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => openEdit(scent)}
                      className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md border border-white/60 flex items-center justify-center text-nature-muted hover:text-nature-olive hover:bg-white transition-colors shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(scent.id)}
                      disabled={deletingId === scent.id}
                      className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md border border-white/60 flex items-center justify-center text-nature-muted hover:text-rose-600 hover:bg-white transition-colors shadow-sm disabled:opacity-50"
                    >
                      {deletingId === scent.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
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