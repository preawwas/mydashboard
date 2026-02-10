import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, Investment, InvestmentFilters, PaginatedResponse } from '@/types';

// Auth Store
interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: true,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setLoading: (isLoading) => set({ isLoading }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

// Investment Store
interface InvestmentState {
    investments: Investment[];
    selectedInvestment: Investment | null;
    filters: InvestmentFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    isLoading: boolean;
    setInvestments: (response: PaginatedResponse<Investment>) => void;
    setSelectedInvestment: (investment: Investment | null) => void;
    setFilters: (filters: InvestmentFilters) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setLoading: (loading: boolean) => void;
    addInvestment: (investment: Investment) => void;
    updateInvestment: (investment: Investment) => void;
    removeInvestment: (id: string) => void;
}

export const useInvestmentStore = create<InvestmentState>((set) => ({
    investments: [],
    selectedInvestment: null,
    filters: {},
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    isLoading: true,
    setInvestments: (response) =>
        set({
            investments: response.data,
            pagination: {
                page: response.page,
                limit: response.limit,
                total: response.total,
                totalPages: response.totalPages,
            },
        }),
    setSelectedInvestment: (investment) => set({ selectedInvestment: investment }),
    setFilters: (filters) => set({ filters }),
    setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),
    setLimit: (limit) => set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } })),
    setLoading: (isLoading) => set({ isLoading }),
    addInvestment: (investment) =>
        set((state) => ({
            investments: [investment, ...state.investments],
            pagination: { ...state.pagination, total: state.pagination.total + 1 },
        })),
    updateInvestment: (investment) =>
        set((state) => ({
            investments: state.investments.map((inv) =>
                inv.id === investment.id ? investment : inv
            ),
        })),
    removeInvestment: (id) =>
        set((state) => ({
            investments: state.investments.filter((inv) => inv.id !== id),
            pagination: { ...state.pagination, total: state.pagination.total - 1 },
        })),
}));

// UI Store
interface UIState {
    sidebarOpen: boolean;
    modalOpen: boolean;
    modalType: 'add' | 'edit' | 'delete' | 'view' | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    openModal: (type: 'add' | 'edit' | 'delete' | 'view') => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    modalOpen: false,
    modalType: null,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    openModal: (type) => set({ modalOpen: true, modalType: type }),
    closeModal: () => set({ modalOpen: false, modalType: null }),
}));

// Toast Store
interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (message, type) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Settings Store
interface SettingsState {
    enableInvestment: boolean;
    enableExpense: boolean;
    toggleInvestment: () => void;
    toggleExpense: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            enableInvestment: true,
            enableExpense: true,
            toggleInvestment: () => set((state) => ({ enableInvestment: !state.enableInvestment })),
            toggleExpense: () => set((state) => ({ enableExpense: !state.enableExpense })),
        }),
        {
            name: 'settings-storage',
            partialize: (state) => ({
                enableInvestment: state.enableInvestment,
                enableExpense: state.enableExpense
            }),
        }
    )
);

// Language Store
interface LanguageState {
    language: 'en' | 'th';
    setLanguage: (lang: 'en' | 'th') => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'language-storage',
            partialize: (state) => ({ language: state.language }),
        }
    )
);


