import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface FinanceState {
    cards: {
        pendapatan: number;
        liabilitas: number;
        pengeluaran: number;
        saldo_anggaran: number;
    };
    chartData: any[];
    distributionData: any[];
    recentLogs: any[];
    settings: {
        point_to_idr_rate: number;
        revenue_margin_percent: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: FinanceState = {
    cards: {
        pendapatan: 0,
        liabilitas: 0,
        pengeluaran: 0,
        saldo_anggaran: 0,
    },
    chartData: [],
    distributionData: [],
    recentLogs: [],
    settings: {
        point_to_idr_rate: 10,
        revenue_margin_percent: 400,
    },
    loading: false,
    error: null,
};

export const fetchFinanceDashboard = createAsyncThunk(
    'finance/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/finance/dashboard');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch finance data');
        }
    }
);

export const updateFinanceSettings = createAsyncThunk(
    'finance/updateSettings',
    async (settings: { point_to_idr_rate: number, revenue_margin_percent: number }, { rejectWithValue }) => {
        try {
            await api.put('/admin/finance/settings', settings);
            return settings;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
        }
    }
);

export const addLedgerEntry = createAsyncThunk(
    'finance/addLedgerEntry',
    async (entry: { type: string, category: string, amount: number, description: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/finance/ledger', entry);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add ledger entry');
        }
    }
);

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFinanceDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinanceDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.cards = action.payload.cards;
                state.chartData = action.payload.chart_data;
                state.distributionData = action.payload.distribution_data;
                state.recentLogs = action.payload.recent_logs;
                state.settings = action.payload.settings;
            })
            .addCase(fetchFinanceDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateFinanceSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            });
    },
});

export default financeSlice.reducer;
