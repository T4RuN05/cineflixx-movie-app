// Path: src/components/Toast.tsx

'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Toast() {
    const { toast, showToast } = useAppContext();

    if (!toast) return null;

    const Icon = toast.type === 'success' ? FaCheckCircle : FaTimesCircle;
    const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const shadowColor = toast.type === 'success' ? 'shadow-green-500/50' : 'shadow-red-500/50';

    return (
        <div className="fixed top-4 right-4 z-[100] transition-all duration-300 transform translate-y-0 opacity-100">
            <div className={`flex items-center p-4 rounded-lg text-white ${bgColor} shadow-xl ${shadowColor}`}>
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{toast.message}</span>
                <button 
                    onClick={() => showToast('', 'success')} // Quick way to dismiss
                    className="ml-4 text-white/80 hover:text-white transition-colors"
                    aria-label="Close notification"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}