import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <CartProvider>

        <App />
        <ToastContainer />

      </CartProvider>
    </ToastProvider>
  </React.StrictMode>,
)