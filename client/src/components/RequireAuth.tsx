// client/src/components/RequireAuth.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: JSX.Element }) {
    const { user } = useAuthStore();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export function RequireAdmin({ children }: { children: JSX.Element }) {
    const { user } = useAuthStore();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}