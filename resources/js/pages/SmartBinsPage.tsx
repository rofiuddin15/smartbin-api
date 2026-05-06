import React, { useState, useEffect, useRef } from 'react';
import { Trash2, MapPin, Signal, Battery, AlertTriangle, Search, Plus, Users, LayoutGrid, Map as MapIcon, X, User, ShieldAlert, Lock, Save, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchBins, addBin, updateBin, deleteBin as deleteBinFromStore } from '../store/slices/smartBinsSlice';
import api from '../utils/api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SmartBin {
    id: number;
    bin_code: string;
    name: string;
    location: string;
    responsible_person: string;
    username: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'offline' | 'full' | 'maintenance';
    capacity_percentage: number;
    total_bottles_collected: number;
    last_online_at: string;
}

interface StaffUser {
    id: number;
    name: string;
    email: string;
}

const SmartBinsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { bins, loading, error } = useSelector((state: RootState) => state.smartBins);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBin, setEditingBin] = useState<SmartBin | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [mapError, setMapError] = useState<string | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // For Map Picker in Modal
    const [formData, setFormData] = useState({
        bin_code: '',
        name: '',
        location: '',
        responsible_person: '',
        username: '',
        password: '',
        latitude: '',
        longitude: ''
    });

    const pickerMap = useRef<mapboxgl.Map | null>(null);
    const pickerMarker = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        dispatch(fetchBins());
        fetchStaffUsers();
    }, [dispatch]);

    const fetchStaffUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await api.get('/users'); // Using UserController@index
            if (response.data.success) {
                setStaffUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'map' && bins.length > 0 && !loading) {
            const timer = setTimeout(() => {
                initMap();
            }, 500);
            return () => clearTimeout(timer);
        }
        
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [viewMode, bins, loading]);

    useEffect(() => {
        if (isModalOpen) {
            const timer = setTimeout(() => {
                initPickerMap();
                let resizes = 0;
                const interval = setInterval(() => {
                    if (pickerMap.current) {
                        pickerMap.current.resize();
                    }
                    resizes++;
                    if (resizes > 10) clearInterval(interval);
                }, 300);
            }, 1000);

            return () => {
                clearTimeout(timer);
                if (pickerMap.current) {
                    pickerMap.current.remove();
                    pickerMap.current = null;
                    pickerMarker.current = null;
                }
            };
        }
    }, [isModalOpen]);

    const initMap = () => {
        if (!mapContainer.current || map.current) return;
        
        try {
            const center: [number, number] = [113.475, -7.160];
            const newMap = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/light-v11',
                center: center,
                zoom: 13,
                trackResize: true,
                attributionControl: false
            });

            newMap.addControl(new mapboxgl.NavigationControl(), 'top-left');
            newMap.on('load', () => {
                newMap.resize();
                bins.forEach(bin => {
                    if (!bin.latitude || !bin.longitude) return;
                    const el = document.createElement('div');
                    el.className = 'custom-marker';
                    const markerColor = bin.status === 'full' ? '#ef4444' : bin.status === 'online' ? '#3b82f6' : '#9ca3af';
                    el.innerHTML = `<div style="background-color: ${markerColor}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></div>`;
                    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="padding: 5px;"><h3 style="font-weight: bold; font-size: 14px; margin: 0;">${bin.name}</h3><p style="font-size: 11px; color: #666; margin: 4px 0;">${bin.location}</p></div>`);
                    new mapboxgl.Marker(el).setLngLat([Number(bin.longitude), Number(bin.latitude)]).setPopup(popup).addTo(newMap);
                });
                if (bins.length > 0) {
                    const bounds = new mapboxgl.LngLatBounds();
                    bins.forEach(bin => bounds.extend([Number(bin.longitude), Number(bin.latitude)]));
                    newMap.fitBounds(bounds, { padding: 50, maxZoom: 15 });
                }
            });
            map.current = newMap;
        } catch (err: any) {
            setMapError("Gagal memuat Mapbox: " + err.message);
        }
    };

    const initPickerMap = () => {
        const container = document.getElementById('map-picker-container');
        if (!container || pickerMap.current) return;

        try {
            const initialLat = formData.latitude ? Number(formData.latitude) : -7.160;
            const initialLng = formData.longitude ? Number(formData.longitude) : 113.475;

            const newPickerMap = new mapboxgl.Map({
                container: 'map-picker-container',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [initialLng, initialLat],
                zoom: 15,
                attributionControl: false
            });

            const marker = new mapboxgl.Marker({ draggable: true })
                .setLngLat([initialLng, initialLat])
                .addTo(newPickerMap);

            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                if (lngLat) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: lngLat.lat.toFixed(6),
                        longitude: lngLat.lng.toFixed(6)
                    }));
                }
            });

            newPickerMap.on('click', (e) => {
                marker.setLngLat(e.lngLat);
                setFormData(prev => ({
                    ...prev,
                    latitude: e.lngLat.lat.toFixed(6),
                    longitude: e.lngLat.lng.toFixed(6)
                }));
            });

            newPickerMap.on('load', () => {
                newPickerMap.resize();
            });

            pickerMap.current = newPickerMap;
            pickerMarker.current = marker;
        } catch (err) {
            console.error("Picker Map init failed:", err);
        }
    };

    const fetchBinsData = () => {
        dispatch(fetchBins());
    };

    const handleOpenModal = (bin: SmartBin | null = null) => {
        if (bin) {
            setEditingBin(bin);
            setFormData({
                bin_code: bin.bin_code,
                name: bin.name,
                location: bin.location,
                responsible_person: bin.responsible_person || '',
                username: bin.username || '',
                password: '',
                latitude: bin.latitude?.toString() || '',
                longitude: bin.longitude?.toString() || ''
            });
        } else {
            setEditingBin(null);
            setFormData({
                bin_code: `SB${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                name: '',
                location: '',
                responsible_person: '',
                username: '',
                password: '',
                latitude: '-7.160',
                longitude: '113.475'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBin) {
                const response = await api.put(`/smart-bins/${editingBin.id}`, formData);
                dispatch(updateBin(response.data.data));
            } else {
                const response = await api.post('/smart-bins', formData);
                dispatch(addBin(response.data.data));
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving bin:', error);
            alert('Gagal menyimpan SmartBin. Silakan periksa data kembali.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus SmartBin ini?')) return;
        try {
            await api.delete(`/smart-bins/${id}`);
            dispatch(deleteBinFromStore(id));
        } catch (error) {
            console.error('Error deleting bin:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            online: 'bg-green-100 text-green-700 border-green-200',
            offline: 'bg-gray-100 text-gray-700 border-gray-200',
            full: 'bg-red-100 text-red-700 border-red-200',
            maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        const labels = {
            online: 'Aktif',
            offline: 'Mati',
            full: 'Penuh',
            maintenance: 'Perbaikan',
        };
        return (
            <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-widest", styles[status as keyof typeof styles])}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Lokasi SmartBin IoT</h1>
                    <p className="text-sm text-gray-500">Monitor dan kelola perangkat penampung sampah di seluruh kota</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 p-1 rounded-md flex shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded transition-all flex items-center gap-2 px-4",
                                viewMode === 'grid' ? "bg-admin-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <LayoutGrid size={16} />
                            <span className="text-[12px] font-black uppercase">Grid</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            className={cn(
                                "p-1.5 rounded transition-all flex items-center gap-2 px-4",
                                viewMode === 'map' ? "bg-admin-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <MapIcon size={16} />
                            <span className="text-[12px] font-black uppercase">Peta</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-admin-primary text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition-all text-[12px] font-black uppercase tracking-widest"
                    >
                        <Plus size={18} />
                        Tambah Perangkat
                    </button>
                </div>
            </div>

            {loading && bins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
                    <span className="text-[12px] font-black uppercase tracking-widest">Memuat Perangkat...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 p-8 rounded text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-2" />
                    <p className="text-sm font-bold text-red-700 uppercase">{error}</p>
                    <button onClick={fetchBinsData} className="mt-4 px-6 py-2 bg-red-600 text-white rounded text-[12px] font-black uppercase">Coba Lagi</button>
                </div>
            ) : (
                <>
                    {viewMode === 'map' ? (
                        <div className="bg-white rounded border border-gray-200 overflow-hidden relative shadow-sm">
                            {mapError ? (
                                <div className="flex flex-col items-center justify-center bg-gray-50 p-8 text-center h-[600px]">
                                    <AlertTriangle size={48} className="text-admin-danger mb-4" />
                                    <h3 className="text-base font-black text-gray-800 uppercase">Eror Peta</h3>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md">{mapError}</p>
                                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-admin-primary text-white rounded text-[12px] font-black uppercase tracking-widest shadow-md">Muat Ulang Dashboard</button>
                                </div>
                            ) : (
                                <div className="relative h-[600px] w-full">
                                    <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '600px', backgroundColor: '#f3f4f6' }} />
                                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                                        <button onClick={() => map.current?.resize()} className="bg-white px-4 py-2 rounded shadow-md hover:bg-gray-50 text-gray-700 text-[12px] font-black uppercase tracking-widest border border-gray-200">Perbaiki Tampilan</button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded text-[11px] text-gray-500 border border-gray-100 font-bold">
                                        Status Peta: <span className="text-green-600 uppercase">Siap</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {bins.map((bin) => (
                                <div key={bin.id} className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-4 rounded", bin.status === 'online' ? 'bg-admin-primary/10 text-admin-primary' : 'bg-gray-100 text-gray-500')}>
                                                <Trash2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-800 leading-tight uppercase tracking-tight text-base">{bin.name}</h3>
                                                <p className="text-[12px] text-gray-500 mt-0.5 font-black uppercase tracking-widest">{bin.bin_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                                        {getStatusBadge(bin.status)}
                                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Signal size={14} className={bin.status === 'online' ? 'text-green-500' : 'text-gray-400'} />
                                            <span>{bin.status === 'online' ? 'Sinyal Kuat' : 'Terputus'}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Battery size={16} className={bin.capacity_percentage > 85 ? 'text-admin-danger' : 'text-admin-success'} />
                                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kapasitas Sampah</p>
                                                </div>
                                                <p className={`text-lg font-black ${bin.capacity_percentage > 85 ? 'text-admin-danger' : 'text-gray-800'}`}>{bin.capacity_percentage}%</p>
                                            </div>
                                            <div className="h-3 w-full bg-white rounded-full border border-gray-200 overflow-hidden p-0.5 shadow-inner">
                                                <div className={cn("h-full rounded-sm transition-all duration-1000", bin.capacity_percentage > 85 ? "bg-admin-danger" : bin.capacity_percentage > 60 ? "bg-admin-warning" : "bg-admin-primary")} style={{ width: `${bin.capacity_percentage}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                                <p className="text-xs text-gray-600 font-medium leading-relaxed">{bin.location}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Users size={14} /></div>
                                                <div>
                                                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">Penanggung Jawab</p>
                                                    <p className="text-sm text-gray-800 font-bold uppercase">{bin.responsible_person || 'Belum Ditunjuk'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-gray-50 bg-gray-50/30 flex gap-2">
                                        <button onClick={() => handleOpenModal(bin)} className="flex-1 py-2 bg-white rounded border border-gray-200 text-[12px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors">Kelola Perangkat</button>
                                        <button onClick={() => handleDelete(bin.id)} className="px-4 py-2 rounded text-[12px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MODAL SECTION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{editingBin ? 'Pengaturan SmartBin' : 'Registrasi SmartBin Baru'}</h2>
                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Manajemen Aset IoT Pamekasan</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded text-gray-400"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                            <form id="bin-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Kode Identitas</label>
                                                <input type="text" value={formData.bin_code} onChange={(e) => setFormData({...formData, bin_code: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold uppercase outline-none focus:border-admin-primary" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Nama Perangkat</label>
                                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold uppercase outline-none focus:border-admin-primary" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Penanggung Jawab (PIC)</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                                    <select 
                                                        value={formData.responsible_person} 
                                                        onChange={(e) => setFormData({...formData, responsible_person: e.target.value})} 
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold uppercase outline-none focus:border-admin-primary appearance-none" 
                                                        required
                                                    >
                                                        <option value="">Pilih Penanggung Jawab</option>
                                                        {loadingUsers ? (
                                                            <option disabled>Memuat daftar staff...</option>
                                                        ) : (
                                                            staffUsers.map(u => (
                                                                <option key={u.id} value={u.name}>{u.name}</option>
                                                            ))
                                                        )}
                                                        <option value="Manual Entry" disabled>--- ATAU KETIK MANUAL ---</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <Search size={14} className="text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-admin-primary/5 rounded border border-admin-primary/10 space-y-4">
                                            <div className="flex items-center gap-2 text-admin-primary">
                                                <ShieldAlert size={18} />
                                                <h3 className="text-[12px] font-black uppercase tracking-widest">Autentikasi Perangkat IoT</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Username</label>
                                                    <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold outline-none" required />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                                                    <div className="relative">
                                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold outline-none" placeholder={editingBin ? "•••••••• (Kosongkan jika tetap)" : "Atur password"} required={!editingBin} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Detail Lokasi</label>
                                            <textarea value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-sm font-medium outline-none h-20 resize-none" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Tentukan Lokasi di Peta</label>
                                                <button type="button" onClick={() => pickerMap.current?.resize()} className="text-[11px] text-admin-primary font-black uppercase hover:underline">Perbaiki Tampilan</button>
                                            </div>
                                            <div className="border border-gray-200 rounded overflow-hidden h-[300px] relative bg-white shadow-inner" style={{ zIndex: 1 }}>
                                                <div id="map-picker-container" className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }} />
                                                <div className="absolute bottom-3 right-3 z-[20] bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-black text-gray-600 shadow-lg border border-gray-100 flex items-center gap-2 pointer-events-none uppercase">
                                                    <div className="w-2 h-2 bg-admin-primary rounded-full animate-pulse" />
                                                    Klik atau Geser Marker
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Latitude</label>
                                                <input type="text" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-[12px] font-mono font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Longitude</label>
                                                <input type="text" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded text-[12px] font-mono font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
                            <button type="submit" form="bin-form" className="px-10 py-2.5 bg-admin-primary text-white rounded text-[12px] font-black uppercase tracking-widest shadow-lg shadow-admin-primary/20 hover:bg-blue-600 transition-all flex items-center gap-2">
                                <Save size={18} />
                                {editingBin ? 'Simpan Perubahan' : 'Registrasi Perangkat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBinsPage;
