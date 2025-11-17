import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuthStore } from './AuthContext';

interface Product {
    id: string;
    name: string;
    price: number;
    images?: string[] | string;
    stock: number;
}

interface CartItem {
    id: number;
    productId: string;
    quantity: number;
    Product: Product;
    selected?: boolean;
}

interface CartState {
    items: CartItem[];
    total: number;
    count: number;
    loading: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (id: number, quantity: number) => Promise<void>;
    removeItem: (id: number) => Promise<void>;
    toggleSelect: (id: number) => void;
    clearSelection: () => void;
    selectedItems: CartItem[];
    refresh: () => Promise<void>;
}

const CartContext = createContext<CartState | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const compute = (data: any) => {
        setItems(data.items.map((it: any) => ({ ...it, selected: false })));
        setTotal(data.total);
        setCount(data.count);
    };

    const refresh = async () => {
        if (!user) { setItems([]); setTotal(0); setCount(0); return; }
        setLoading(true);
        try {
            const res = await axiosInstance.get('/cart');
            compute(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, [user]);

    const addToCart = async (productId: string, quantity = 1) => {
        const res = await axiosInstance.post('/cart', { productId, quantity });
        compute(res.data);
    };

    const updateQuantity = async (id: number, quantity: number) => {
        const res = await axiosInstance.patch(`/cart/${id}`, { quantity });
        compute(res.data);
    };

    const removeItem = async (id: number) => {
        const res = await axiosInstance.delete(`/cart/${id}`);
        compute(res.data);
    };

    const toggleSelect = (id: number) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
    };

    const clearSelection = () => {
        setItems(prev => prev.map(it => ({ ...it, selected: false })));
    };

    const selectedItems = items.filter(i => i.selected);

    return (
        <CartContext.Provider value={{
            items, total, count, loading,
            addToCart, updateQuantity, removeItem,
            toggleSelect, clearSelection, selectedItems, refresh
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
};