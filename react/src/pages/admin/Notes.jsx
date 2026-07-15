import { useEffect, useRef, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2, UploadCloud, Link as LinkIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api';
import { useConfirm } from '../../contexts/ConfirmContext';
import AdminPagination from '../../components/Admin/AdminPagination';
import FieldError from '../../components/FieldError';


function NoteModal({ note, onClose, onSaved }) {
  const isEdit = Boolean(note);
  const [name, setName] = useState(note?.name || '');
  const [iconUrl, setIconUrl] = useState(note?.icon_url || '');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function uploadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setFormError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIconUrl(data.url);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      const payload = { name, icon_url: iconUrl || null };
      const { data } = isEdit
        ? await api.put(`/admin/notes/${note.id}`, payload)
        : await api.post('/admin/notes', payload);
      onSaved(data);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bergamot, Oud, Vanilla"
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <FieldError errors={errors} field="name" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-nature-muted text-xs font-semibold tracking-wider uppercase">Icon</label>
              <button
                type="button"
                onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
                className="flex items-center gap-1 text-[11px] text-nature-olive hover:text-nature-olive/80 font-medium"
              >
                {mode === 'upload' ? (
                  <>
                    <LinkIcon className="w-3 h-3" /> Paste URL instead
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3 h-3" /> Upload instead
                  </>
                )}
              </button>
            </div>

            {mode === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-colors ${
                  isDragging ? 'border-nature-olive bg-nature-olive/5' : 'border-nature-border/80 hover:border-nature-olive/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {iconUrl && !uploading ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-nature-border/60 bg-neutral-100">
                    <img src={iconUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : uploading ? (
                  <Loader2 className="w-5 h-5 text-nature-olive animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-nature-muted" />
                )}
                <p className="text-xs text-nature-muted text-center">
                  {uploading ? 'Uploading...' : iconUrl ? 'Click or drop to replace' : 'Click or drag an image here'}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
            <FieldError errors={errors} field="icon_url" />
          </div>

          {formError && <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2">{formError}</p>}

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
              disabled={saving || uploading}
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

function NoteRow({ note, onEdit, onDelete, deleting }) {
  const [imgError, setImgError] = useState(false);

  return (
    <tr className="border-b border-nature-border/40 hover:bg-nature-olive/5 transition-colors">
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
            {note.icon_url && !imgError ? (
              <img
                src={note.icon_url}
                alt={note.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-sm text-nature-olive/40">
                {note.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-medium text-neutral-800 text-sm truncate">{note.name}</p>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            disabled={deleting}
            className="p-1.5 rounded-lg text-nature-muted hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function NoteManagement() {
  const confirm = useConfirm();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Table view state
  const [sortDir, setSortDir] = useState('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

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

  function handleDelete(id) {
    confirm({
      title: 'Delete Note',
      message: 'Delete this note? This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await api.delete(`/admin/notes/${id}`);
          setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
          console.error('Failed to delete note:', err);
          throw err;
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  function toggleSort() {
    setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
  }

  const filteredNotes = useMemo(
    () => notes.filter((n) => n.name.toLowerCase().includes(search.toLowerCase())),
    [notes, search]
  );

  const sortedNotes = useMemo(() => {
    const arr = [...filteredNotes];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const av = a.name?.toLowerCase() ?? '';
      const bv = b.name?.toLowerCase() ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filteredNotes, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  const totalPages = Math.max(1, Math.ceil(sortedNotes.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visibleNotes = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sortedNotes.slice(start, start + perPage);
  }, [sortedNotes, clampedPage, perPage]);

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
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden divide-y divide-nature-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/20 animate-pulse" />
              ))}
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {search ? `No notes match "${search}".` : 'No notes yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[420px]">
                  <thead>
                    <tr className="border-b border-nature-border text-[11px] uppercase tracking-wide text-nature-muted bg-white/20">
                      <th onClick={toggleSort} className="py-2.5 pl-4 pr-3 font-medium cursor-pointer select-none group whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-nature-olive">
                          Note
                          {sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNotes.map((note) => (
                      <NoteRow
                        key={note.id}
                        note={note}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        deleting={deletingId === note.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminPagination
                page={clampedPage}
                totalPages={totalPages}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={setPerPage}
                totalItems={sortedNotes.length}
              />
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