import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { registerNotificationHandler } from './NotificationBridge';

const NotificationContext = createContext(null);

const VARIANTS = {
    success: { icon: CheckCircle2, iconClass: 'text-nature-olive', barClass: 'bg-nature-olive' },
    error:   { icon: XCircle,      iconClass: 'text-red-500',      barClass: 'bg-red-500' },
    warning: { icon: AlertCircle,  iconClass: 'text-amber-600',    barClass: 'bg-amber-600' },
    info:    { icon: Info,         iconClass: 'text-nature-dark',  barClass: 'bg-nature-dark' },
};

let idCounter = 0;

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const timers = useRef({});

   const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (timers.current[id]) {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }
}, []);

// duration=0 means "stick until dismissed" — useful for errors the user should read
const notify = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    let dedupedId = null;

    setNotifications(prev => {
        const existing = prev.find(n => n.type === type && n.message === message);
        if (existing) {
            dedupedId = existing.id;
            return prev; // already showing — don't add a duplicate
        }
        return prev;
    });

    if (dedupedId !== null) {
        // Same toast is already visible — just restart its dismiss timer.
        if (timers.current[dedupedId]) clearTimeout(timers.current[dedupedId]);
        if (duration > 0) {
            timers.current[dedupedId] = setTimeout(() => remove(dedupedId), duration);
        }
        return dedupedId;
    }

    const id = ++idCounter;
    setNotifications(prev => [...prev, { id, type, title, message }]);
    if (duration > 0) {
        timers.current[id] = setTimeout(() => remove(id), duration);
    }
    return id;
}, [remove]);

    const api = {
        notify,
        success: (message, opts = {}) => notify({ type: 'success', message, ...opts }),
        error:   (message, opts = {}) => notify({ type: 'error', message, ...opts }),
        warning: (message, opts = {}) => notify({ type: 'warning', message, ...opts }),
        info:    (message, opts = {}) => notify({ type: 'info', message, ...opts }),
        dismiss: remove,
    };
 useEffect(() => {
        registerNotificationHandler(notify);
    }, [notify]);

    return (
        <NotificationContext.Provider value={api}>
            {children}
            <NotificationContainer notifications={notifications} onDismiss={remove} />
        </NotificationContext.Provider>
    );
}

// Every page/component calls this — no need to import the toast UI itself.
export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotification must be used inside <NotificationProvider>');
    }
    return ctx;
}

function NotificationContainer({ notifications, onDismiss }) {
    if (notifications.length === 0) return null;

    return ReactDOM.createPortal(
        <div className="fixed top-20 right-4 z-[999999] flex flex-col gap-2.5 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
            {notifications.map((n) => (
                <NotificationToast key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
            ))}
        </div>,
        document.body
    );
}

function NotificationToast({ notification, onDismiss }) {
    const { type, title, message } = notification;
    const variant = VARIANTS[type] ?? VARIANTS.info;
    const Icon = variant.icon;

    return (
        <div
            role="status"
            className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-lg shadow-[0_4px_24px_-12px_rgba(44,53,39,0.25)] overflow-hidden animate-[toastIn_0.25s_ease-out] pointer-events-auto"
        >
            <div className={`absolute left-0 top-0 h-full w-0.5 ${variant.barClass}`} />
            <div className="flex items-start gap-3 p-4 pl-5">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${variant.iconClass}`} strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                    {title && <p className="font-serif text-sm text-nature-dark leading-tight">{title}</p>}
                    <p className={`text-nature-muted text-xs leading-relaxed ${title ? 'mt-1' : ''}`}>{message}</p>
                </div>
                <button
                    onClick={onDismiss}
                    className="p-1 -m-1 hover:bg-white/50 rounded-md transition-colors flex-shrink-0"
                    aria-label="Dismiss notification"
                >
                    <X className="w-3.5 h-3.5 text-nature-muted" strokeWidth={1.5} />
                </button>
            </div>

            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}