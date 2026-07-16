import { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

const ConfirmContext = createContext(null);

const modalPanelClass = "bg-white border border-nature-border/50 rounded-lg shadow-[0_20px_60px_-15px_rgba(44,53,39,0.35)]";

export function ConfirmProvider({ children }) {
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmLabel, onConfirm }
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [confirmError, setConfirmError] = useState('');

    function openConfirm({ title, message, confirmLabel = 'Confirm', onConfirm }) {
        setConfirmError('');
        setConfirmModal({ title, message, confirmLabel, onConfirm });
    }

    function closeConfirm() {
        setConfirmModal(null);
        setConfirmError('');
    }

    async function handleConfirm() {
        if (!confirmModal) return;
        setConfirmLoading(true);
        setConfirmError('');
        try {
            await confirmModal.onConfirm();
            closeConfirm();
        } catch (err) {
            // Surface whatever the backend said (e.g. a 422 explaining why
            // the delete is blocked) right in the dialog, instead of just
            // logging it and leaving the modal with no visible feedback.
            // Keeps the modal open so the person can read it and retry/cancel.
            const message = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
            setConfirmError(message);
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
                        <p className="text-nature-muted text-sm mb-4">{confirmModal.message}</p>

                        {confirmError && (
                            <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-2 mb-4">
                                {confirmError}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={closeConfirm}
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