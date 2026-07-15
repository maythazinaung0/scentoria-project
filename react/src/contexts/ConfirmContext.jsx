import { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

const ConfirmContext = createContext(null);

const modalPanelClass = "bg-white border border-nature-border/50 rounded-lg shadow-[0_20px_60px_-15px_rgba(44,53,39,0.35)]";

export function ConfirmProvider({ children }) {
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmLabel, onConfirm }
    const [confirmLoading, setConfirmLoading] = useState(false);

    function openConfirm({ title, message, confirmLabel = 'Confirm', onConfirm }) {
        setConfirmModal({ title, message, confirmLabel, onConfirm });
    }

    async function handleConfirm() {
        if (!confirmModal) return;
        setConfirmLoading(true);
        try {
            await confirmModal.onConfirm();
            setConfirmModal(null);
        } catch (err) {
            // The action's own catch (in the caller) is responsible for
            // surfacing errors — this just keeps the modal open so the
            // person can retry instead of it silently disappearing.
        } finally {
            setConfirmLoading(false);
        }
    }

    return (
        <ConfirmContext.Provider value={{ openConfirm }}>
            {children}
            {confirmModal && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className={`${modalPanelClass} max-w-sm w-full p-6`}>
                        <h3 className="font-serif text-lg text-nature-dark mb-2">{confirmModal.title}</h3>
                        <p className="text-nature-muted text-sm mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={confirmLoading}
                                className="flex-1 border border-nature-border text-nature-dark hover:bg-nature-bg disabled:opacity-50 px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={confirmLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-md text-xs font-medium tracking-wide uppercase transition-colors"
                            >
                                {confirmLoading ? 'Please wait...' : confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
    return ctx.openConfirm;
}