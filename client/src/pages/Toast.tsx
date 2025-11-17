// components/Toast.tsx
export function Toast({ message }: { message: string }) {
    return (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow animate-scale-in text-sm">
            {message}
        </div>
    );
}