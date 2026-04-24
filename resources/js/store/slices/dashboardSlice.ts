import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface DashboardStats {
    stats: {
        trash_collected: string;
        active_bins: number;
        new_users: number;
        total_participants: string;
    };
    chart_data: Array<{ name: string; botol: number }>;
    recent_transactions: any[];
}

interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async (_, { getState }) => {
    const state = getState() as { dashboard: DashboardState };
    // Cache for 2 minutes
    if (state.dashboard.lastFetched && Date.now() - state.dashboard.lastFetched < 2 * 60 * 1000) {
        return state.dashboard.stats;
    }
    const response = await api.get('/dashboard/stats');
    return response.data.data;
});

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            });
    },
});

export default dashboardSlice.reducer;
