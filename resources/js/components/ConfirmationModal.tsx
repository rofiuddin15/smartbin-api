import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    isDanger = true,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                            isDanger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 tracking-tight leading-none mb-2 uppercase">{title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 rounded transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className={cn(
                            "px-5 py-2 text-white text-[12px] font-black uppercase tracking-widest rounded shadow-md transition-all flex items-center justify-center gap-2",
                            isDanger 
                                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                                : "bg-admin-primary hover:bg-blue-700 shadow-admin-primary/20"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
