import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Trash2, 
    Mail, 
    Lock, 
    ArrowRight, 
    ShieldCheck, 
    Loader2,
    AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../utils/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect to dashboard
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Email atau kata sandi salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/30 mb-4 animate-bounce-slow">
                        <Trash2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                        SmartBin <span className="text-blue-500">Pamekasan</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Sistem Administrasi Pusat</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                    
                    <div className="relative">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Selamat Datang</h2>
                            <p className="text-slate-400 text-sm mt-1">Gunakan kredensial staff Anda untuk masuk</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-shake">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="email" 
                                        placeholder="admin@smartbin.example"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="password" 
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 font-bold"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mt-2">
                                <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300">
                                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-900" />
                                    Ingat Saya
                                </label>
                                <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">Lupa Password?</a>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group mt-8"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Masuk Sekarang
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-blue-500/50" />
                        SmartBin Secure Authentication V1.0
                    </p>
                </div>
            </div>

            {/* Custom Styles for Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}} />
        </div>
    );
};

export default LoginPage;
