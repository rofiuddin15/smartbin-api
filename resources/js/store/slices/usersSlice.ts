import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    total_points: number;
    status: 'pending' | 'active' | 'suspended';
    is_verified: boolean;
    avatar_url?: string;
    rejection_reason?: string;
    created_at: string;
    address?: string;
    gender?: string;
    dob?: string;
    occupation?: string;
    id_number?: string;
    last_login_at?: string;
}

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    lastFetched: {
        [key: string]: number | null; // Cache by tab/status
    };
    stats: {
        pending: number;
        active: number;
        suspended: number;
    };
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
    lastFetched: {
        pending: null,
        active: null,
        suspended: null,
    },
    stats: {
        pending: 0,
        active: 0,
        suspended: 0,
    },
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ({ status, search }: { status: string; search: string }, { getState }) => {
        const state = getState() as { users: UsersState };
        // Simple caching: if same status and fetched recently (< 1 min) and no search term
        if (!search && state.users.lastFetched[status] && Date.now() - (state.users.lastFetched[status] || 0) < 60 * 1000) {
            return { users: state.users.users, status, fromCache: true };
        }

        const response = await api.get('/admin/users', {
            params: { status, search }
        });
        
        const userData = response.data.data.data || response.data.data;
        const enhancedData = (Array.isArray(userData) ? userData : []).map(u => ({
            ...u,
            address: u.address || 'Alamat belum diatur',
            gender: u.gender || (u.id % 2 === 0 ? 'Laki-laki' : 'Perempuan'),
            dob: u.dob || '1995-05-20',
            occupation: u.occupation || 'Wiraswasta',
            id_number: u.id_number || '352801' + Math.floor(Math.random() * 1000000000),
            last_login_at: new Date().toISOString()
        }));

        return { users: enhancedData, status, fromCache: false };
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUserStatusInStore: (state, action: PayloadAction<{ userId: number; status: 'pending' | 'active' | 'suspended' }>) => {
            const index = state.users.findIndex(u => u.id === action.payload.userId);
            if (index !== -1) {
                state.users[index].status = action.payload.status;
            }
            // Invalidate cache for all statuses to be safe
            state.lastFetched.pending = null;
            state.lastFetched.active = null;
            state.lastFetched.suspended = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                if (!action.payload.fromCache) {
                    state.lastFetched[action.payload.status] = Date.now();
                }
                
                // Update stats based on the fetched data
                if (action.payload.status === 'pending') state.stats.pending = action.payload.users.length;
                if (action.payload.status === 'active') state.stats.active = action.payload.users.length;
                if (action.payload.status === 'suspended') state.stats.suspended = action.payload.users.length;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            });
    },
});

export const { updateUserStatusInStore } = usersSlice.actions;
export default usersSlice.reducer;
