import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import api from '../../api';

function NoteModal({ note, onClose, onSaved }) {
  const isEdit = Boolean(note);
  const [name, setName] = useState(note?.name || '');
  const [iconUrl, setIconUrl] = useState(note?.icon_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name, icon_url: iconUrl || null };
      const { data } = isEdit
        ? await api.put(`/admin/notes/${note.id}`, payload)
        : await api.post('/admin/notes', payload);
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
          <h2 className="font-serif text-2xl text-neutral-800">{isEdit ? 'Edit Note' : 'New Olfactive Note'}</h2>
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
              placeholder="e.g. Bergamot, Oud, Vanilla"
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Icon URL <span className="normal-case font-normal opacity-60">(optional)</span></label>
            <input
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            {iconUrl && (
              <div className="mt-3 w-16 h-16 rounded-xl overflow-hidden border border-nature-border/60 bg-neutral-100 flex items-center justify-center">
                <img src={iconUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
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
              {isEdit ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, deleting }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(74,104,56,0.25)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
          {note.icon_url && !imgError ? (
            <img
              src={note.icon_url}
              alt={note.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif text-xl text-nature-olive/40">
              {note.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-nature-olive text-[10px] font-semibold tracking-[0.15em] uppercase mb-0.5">
            Olfactive Note
          </p>
          <h3 className="font-serif text-lg text-neutral-800 truncate">{note.name}</h3>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 px-5 pb-4 pt-3 border-t border-nature-border/50">
        <button
          onClick={() => onEdit(note)}
          className="flex items-center gap-1.5 text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(note.id)}
          disabled={deleting}
          className="flex items-center gap-1.5 text-nature-muted hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium px-2.5 py-1.5 rounded-lg disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
    </div>
  );
}

export default function NoteManagement() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function fetchNotes() {
    setLoading(true);
    api.get('/admin/notes')
      .then(({ data }) => setNotes(data))
      .catch((err) => console.error('Failed to load notes:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  function openCreate() {
    setEditingNote(null);
    setModalOpen(true);
  }

  function openEdit(note) {
    setEditingNote(note);
    setModalOpen(true);
  }

  function handleSaved(saved) {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === saved.id);
      return exists ? prev.map((n) => (n.id === saved.id ? saved : n)) : [saved, ...prev];
    });
    setModalOpen(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredNotes = notes.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-7xl mx-auto">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Olfactive Notes</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-nature-olive hover:bg-nature-olive/90 text-white text-xs font-medium tracking-wide transition-colors px-4 py-2.5 rounded-xl shadow-[0_4px_16px_-4px_rgba(74,104,56,0.5)]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nature-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-nature-border/80 focus:border-nature-olive/60 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors placeholder-nature-muted/70"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 bg-white/20 border border-white/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {search ? `No notes match "${search}".` : 'No notes yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  deleting={deletingId === note.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <NoteModal
          note={editingNote}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}