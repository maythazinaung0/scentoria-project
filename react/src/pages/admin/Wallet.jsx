import { useEffect, useState } from 'react';
import { Check, X, Loader2, ImageOff, Wallet, Clock, CheckCircle2, XCircle, User } from 'lucide-react';
import api from '../../api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200/60', icon: Clock },
  completed: { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60', icon: CheckCircle2 },
  // Backend enum is 'rejected', not 'cancelled' — this used to be 'cancelled'
  // here, which meant the reject action silently failed (backend returned
  // a 422 the UI never surfaced).
  rejected: { label: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200/60', icon: XCircle },
};

const CHANNEL_LABELS = {
  kbzpay: 'KBZPay',
  cbpay: 'CB Pay',
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}


function ImagePreviewModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={url} alt="Transaction proof"
          className="w-full max-h-[80vh] object-contain  "
        />
      </div>
    </div>
  );
}

function TopupRow({ topup, onDecide, deciding, onPreview }) {
  const [imgError, setImgError] = useState(false);
  const isPending = topup.status === 'pending';
  const canPreview = Boolean(topup.transaction_image_url) && !imgError;

  return (
    <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-[0_2px_16px_-4px_rgba(44,53,39,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(74,104,56,0.15)] transition-shadow">
      <div className="flex items-start gap-4">
        <button
          onClick={() => canPreview && onPreview(topup.transaction_image_url)}
          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-nature-border/60 bg-neutral-100 flex items-center justify-center"
        >
          {canPreview ? (
            <img
              src={topup.transaction_image_url}
              alt="Proof"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageOff className="w-5 h-5 text-nature-muted/50" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-serif text-lg text-neutral-800">
                {topup.user?.name || `User #${topup.user_id}`}
              </p>
              <p className="text-nature-muted text-xs">{topup.user?.email}</p>
            </div>
            <StatusBadge status={topup.status} />
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
            <span className="font-serif text-xl text-neutral-800">
              {Number(topup.deposit_amount).toLocaleString()} Ks
            </span>
            <span className="text-nature-muted text-xs font-semibold tracking-wide uppercase px-2 py-1 rounded-lg bg-nature-olive/10 text-nature-olive">
              {CHANNEL_LABELS[topup.topup_channel] || topup.topup_channel}
            </span>
            <span className="text-nature-muted text-xs">
              {new Date(topup.created_at).toLocaleString()}
            </span>
          </div>

          {/* Cross-check info — this is what the admin actually matches
              against their own KBZ Pay/CB Pay transaction history */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 pt-3 border-t border-nature-border/40">
            <span className="flex items-center gap-1.5 text-xs text-neutral-700">
              <User className="w-3.5 h-3.5 text-nature-muted" />
              Sender: <span className="font-medium">{topup.sender_name || '—'}</span>
            </span>

            {canPreview && (
              <button
                onClick={() => onPreview(topup.transaction_image_url)}
                className="text-xs text-nature-olive hover:text-nature-olive-dark font-medium transition-colors"
              >
                View Screenshot
              </button>
            )}
          </div>

          {topup.status !== 'pending' && topup.approved_by && (
            <p className="text-nature-muted text-[11px] mt-2">
              Reviewed by {topup.approved_by?.name || `user #${topup.approved_by}`}
              {topup.approved_at && ` on ${new Date(topup.approved_at).toLocaleString()}`}
            </p>
          )}

          {isPending && (
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => onDecide(topup.id, 'completed')}
                disabled={deciding}
                className="flex items-center gap-1.5 bg-nature-olive hover:bg-nature-olive/90 disabled:opacity-60 text-white text-xs font-medium tracking-wide rounded-xl px-3.5 py-2 transition-colors"
              >
                {deciding === 'completed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => onDecide(topup.id, 'rejected')}
                disabled={deciding}
                className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60 text-xs font-medium tracking-wide rounded-xl px-3.5 py-2 border border-rose-200/60 transition-colors"
              >
                {deciding === 'rejected' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WalletTopups() {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [decidingId, setDecidingId] = useState(null);
  const [decidingStatus, setDecidingStatus] = useState(null);
  const [actionError, setActionError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  function fetchTopups(signal) {
    if (!hasLoadedOnce) setLoading(true);
    api.get('/admin/wallet-topups', { signal })
      .then(({ data }) => {
        setTopups(data);
        setHasLoadedOnce(true);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') console.error('Failed to load wallet top-ups:', err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTopups(controller.signal);
    return () => controller.abort();
  }, []);

  async function handleDecide(id, status) {
    setDecidingId(id);
    setDecidingStatus(status);
    setActionError('');
    try {
      const { data } = await api.put(`/admin/wallet-topups/${id}`, { status });
      setTopups((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (err) {
      console.error('Failed to update top-up:', err);
      setActionError(err.response?.data?.message || 'Could not update this request. Please try again.');
    } finally {
      setDecidingId(null);
      setDecidingStatus(null);
    }
  }

  const filteredTopups = topups.filter((t) => filter === 'all' || t.status === filter);
  const pendingCount = topups.filter((t) => t.status === 'pending').length;

  const tabs = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-nature-olive/10">
      <div className="relative p-6 md:p-10 z-10">
        <div className="text-nature-dark space-y-8 max-w-4xl mx-auto">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nature-olive/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-nature-olive" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-normal tracking-tight text-neutral-800">Wallet Top-Ups</h1>
              <p className="text-nature-muted text-xs font-medium tracking-wide uppercase opacity-80">
                {pendingCount} pending review
              </p>
            </div>
          </div>

          {actionError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
              {actionError}
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-nature-border/60 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative text-xs font-medium tracking-wide uppercase px-4 py-2.5 transition-colors ${
                  filter === tab.key
                    ? 'text-nature-olive'
                    : 'text-nature-muted hover:text-neutral-800'
                }`}
              >
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] rounded-full bg-nature-olive text-white">
                    {tab.count}
                  </span>
                )}
                {filter === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-nature-olive rounded-full" />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl h-32 animate-pulse" />
              ))}
            </div>
          ) : filteredTopups.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-nature-border/80 rounded-2xl p-16 text-center">
              <p className="text-nature-muted text-sm">
                No {filter !== 'all' ? filter : ''} top-up requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopups.map((topup) => (
                <TopupRow
                  key={topup.id}
                  topup={topup}
                  onDecide={handleDecide}
                  deciding={decidingId === topup.id ? decidingStatus : null}
                  onPreview={setPreviewUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}