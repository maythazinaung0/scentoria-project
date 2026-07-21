import { useEffect, useRef, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2, UploadCloud, Link as LinkIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api';
import { useConfirm } from '../../contexts/ConfirmContext';
import FieldError from '../../components/FieldError';
import AdminPagination from '../../components/Admin/AdminPagination';

function ScentModal({ scent, onClose, onSaved }) {
  const isEdit = Boolean(scent);
  const [name, setName] = useState(scent?.name || '');
  const [description, setDescription] = useState(scent?.description || '');
  const [imageUrl, setImageUrl] = useState(scent?.image_url || '');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState('');
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
      setImageUrl(data.url);
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
      const payload = { name, description, image_url: imageUrl || null };
      const { data } = isEdit
        ? await api.put(`/admin/scents/${scent.id}`, payload)
        : await api.post('/admin/scents', payload);
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
          <h2 className="font-serif text-2xl text-neutral-800">{isEdit ? 'Edit Scent' : 'New Scent Family'}</h2>
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
              placeholder="e.g. Floral, Woody, Oriental"
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <FieldError errors={errors} field="name" />
          </div>

          <div>
            <label className="block text-nature-muted text-xs font-semibold tracking-wider uppercase mb-1.5">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the character of this scent family..."
              className="w-full bg-white/70 border border-nature-border/80 focus:border-nature-olive/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none"
            />
            <FieldError errors={errors} field="description" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-nature-muted text-xs font-semibold tracking-wider uppercase">Image</label>
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
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-colors ${isDragging ? 'border-nature-olive bg-nature-olive/5' : 'border-nature-border/80 hover:border-nature-olive/50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {imageUrl && !uploading ? (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-nature-border/60 bg-neutral-100">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : uploading ? (
                  <Loader2 className="w-5 h-5 text-nature-olive animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-nature-muted" />
                )}
                <p className="text-xs text-nature-muted text-center">
                  {uploading ? 'Uploading...' : imageUrl ? 'Click or drop to replace' : 'Click or drag an image here'}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
            <FieldError errors={errors} field="image_url" />
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
              {isEdit ? 'Save Changes' : 'Create Scent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScentDetailModal({ scent, onClose, onEdit }) {
  const [imgError, setImgError] = useState(false);
  const showImage = scent.image_url && !imgError;

  return (
    <div className="fixed inset-0 bg-nature-dark/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-nature-card border border-nature-olive/20 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nature-olive/20 flex-shrink-0">
          <h2 className="font-serif text-xl">Scent Family Details</h2>
          <button onClick={onClose} className="text-nature-muted hover:text-nature-olive transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex gap-4 items-center bg-nature-bg p-3 rounded-xl border border-nature-olive/20">
            {showImage ? (
              <img
                src={scent.image_url}
                alt={scent.name}
                onError={() => setImgError(true)}
                className="w-24 h-24 rounded-xl object-cover border border-nature-olive/20 flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border border-nature-olive/20 bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100 flex items-center justify-center flex-shrink-0">
                <span className="font-serif text-3xl text-nature-olive/35">
                  {scent.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-nature-olive text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">Fragrance Family</p>
              <h3 className="font-serif text-xl font-medium break-words">{scent.name}</h3>
            </div>
          </div>

          <div className="bg-nature-bg border border-nature-olive/15 p-3 rounded-lg">
            <span className="text-nature-olive text-[10px] font-semibold uppercase tracking-wider block mb-1">Description</span>
            {scent.description ? (
              <p className="text-nature-dark text-sm leading-relaxed break-words whitespace-pre-wrap">{scent.description}</p>
            ) : (
              <p className="text-nature-muted text-sm italic">No description added yet.</p>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-nature-olive/20 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 border border-nature-olive/30 text-nature-dark hover:border-nature-olive hover:text-nature-olive transition-colors py-2 rounded-xl text-sm">Close</button>
          <button type="button" onClick={() => onEdit(scent)} className="flex-1 bg-nature-olive hover:bg-nature-olive-dark transition-colors text-white py-2 rounded-xl text-sm font-semibold">Edit Scent</button>
        </div>
      </div>
    </div>
  );
}

function ScentRow({ scent, onEdit, onDelete, deleting, onSelect }) {
  const [imgError, setImgError] = useState(false);

  return (
    <tr onClick={() => onSelect(scent)} className="border-b border-nature-border/40 hover:bg-nature-olive/5 cursor-pointer transition-colors">
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-nature-olive/15 via-nature-sage/25 to-neutral-100">
            {scent.image_url && !imgError ? (
              <img
                src={scent.image_url}
                alt={scent.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-sm text-nature-olive/40">
                {scent.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-800 text-sm truncate">{scent.name}</p>
            <p className="text-nature-olive text-[10px] font-semibold tracking-[0.1em] uppercase">Fragrance Family</p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-sm text-nature-muted max-w-sm">
        <p className="truncate">{scent.description || '—'}</p>
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(scent); }}
            className="p-1.5 rounded-lg text-nature-muted hover:text-nature-olive hover:bg-nature-olive/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(scent.id); }}
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

export default function ScentManagement() {
  const confirm = useConfirm();
  const [scents, setScents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScent, setEditingScent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [selectedScent, setSelectedScent] = useState(null);

  // Table view state
  const [sortDir, setSortDir] = useState('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

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

  function openEditFromDetail(scent) {
    setSelectedScent(null);
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

  function handleDelete(id) {
    confirm({
      title: 'Delete Scent Family',
      message: 'Delete this scent family? This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await api.delete(`/admin/scents/${id}`);
          setScents((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
          console.error('Failed to delete scent:', err);
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

  const filteredScents = useMemo(
    () => scents.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [scents, search]
  );

  const sortedScents = useMemo(() => {
    const arr = [...filteredScents];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const av = a.name?.toLowerCase() ?? '';
      const bv = b.name?.toLowerCase() ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filteredScents, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  const totalPages = Math.max(1, Math.ceil(sortedScents.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const visibleScents = useMemo(() => {
    const start = (clampedPage - 1) * perPage;
    return sortedScents.slice(start, start + perPage);
  }, [sortedScents, clampedPage, perPage]);

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nature-muted" />
            <input type="text" placeholder="Search scent families..." value={search} onChange={e => setSearch(e.target.value)} className="bg-white/70 border border-nature-border/50 focus:border-nature-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-colors w-64 placeholder-nature-muted/70" />
          </div>
          {loading ? (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden divide-y divide-nature-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/20 animate-pulse" />
              ))}
            </div>
          ) : sortedScents.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                {search ? `No scent families match "${search}".` : 'No scent families yet — add your first one.'}
              </p>
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-nature-border text-[11px] uppercase tracking-wide text-nature-muted bg-white/20">
                      <th onClick={toggleSort} className="py-2.5 pl-4 pr-3 font-medium cursor-pointer select-none group whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-nature-olive">
                          Scent Family
                          {sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </span>
                      </th>
                      <th className="py-2.5 px-3 font-medium">Description</th>
                      <th className="py-2.5 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleScents.map((scent) => (
                      <ScentRow
                        key={scent.id}
                        scent={scent}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        deleting={deletingId === scent.id}
                        onSelect={setSelectedScent}
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
                totalItems={sortedScents.length}
              />
            </div>
          )}
        </div>
      </div>

      {selectedScent && (
        <ScentDetailModal
          scent={selectedScent}
          onClose={() => setSelectedScent(null)}
          onEdit={openEditFromDetail}
        />
      )}

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