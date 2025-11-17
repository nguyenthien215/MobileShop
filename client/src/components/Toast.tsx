import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (!toasts.length) return null;

    return (
        <div className="fixed top-5 right-5 z-[2000] flex flex-col gap-3">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={
                        'min-w-[240px] px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-start gap-3 animate-scale-in ' +
                        (t.type === 'error'
                            ? 'bg-red-600 text-white'
                            : t.type === 'info'
                                ? 'bg-blue-600 text-white'
                                : 'bg-green-600 text-white')
                    }
                >
                    <span className="flex-1">{t.message}</span>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="text-white/80 hover:text-white text-xs font-bold"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}