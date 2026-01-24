/**
 * Elegant Tex Server - Design System
 * 
 * Primary Palette:
 * - Brand Blue: #007AFF (Trust, Professionalism)
 * - Accent Cyan: #06b6d4 (Vibrancy)
 * - Success Green: #10b981
 * - Warning Amber: #f59e0b
 * - Error Red: #ef4444
 * 
 * Surface:
 * - Clean White (#ffffff)
 * - Slate Grays (Tailwind Slate)
 */

export const themeToken = {
    colorPrimary: '#007AFF', // Modern iOS-like Blue
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#06b6d4',
    wireframe: false,
    borderRadius: 8, // Softer curves
    borderRadiusLG: 12,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
};

// Light Theme Component Overrides
const lightComponentTheme = {
    Button: {
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        borderRadius: 8,
        fontWeight: 600,
        colorPrimaryShadow: '0 4px 14px 0 rgba(0, 122, 255, 0.35)',
    },
    Input: {
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        borderRadius: 8,
        colorBgContainer: '#f8fafc', // Slate-50
        colorBorder: '#e2e8f0', // Slate-200
    },
    Select: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#f8fafc',
    },
    Card: {
        borderRadiusLG: 16,
        colorBgContainer: '#ffffff',
        boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
    Table: {
        borderRadiusLG: 12,
        headerBg: '#f8fafc',
        headerColor: '#475569',
        headerSplitColor: 'transparent',
    },
    Layout: {
        colorBgHeader: 'rgba(255, 255, 255, 0.8)',
        colorBgBody: '#f1f5f9',
        siderBg: '#0f172a',
    },
    Menu: {
        colorItemBg: 'transparent',
        colorItemText: '#94a3b8',
        colorItemTextSelected: '#ffffff',
        colorItemBgSelected: '#007AFF', // Brand blue background
        itemBorderRadius: 8,
        itemMarginInline: 8,
    }
};

// Dark Theme Component Overrides
const darkComponentTheme = {
    Button: {
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        borderRadius: 8,
        fontWeight: 600,
        colorPrimaryShadow: '0 4px 14px 0 rgba(0, 122, 255, 0.2)',
    },
    Input: {
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        borderRadius: 8,
        colorBgContainer: '#1e293b', // Slate-800
        colorBorder: '#334155', // Slate-700
    },
    Select: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#1e293b', // Slate-800
    },
    Card: {
        borderRadiusLG: 16,
        colorBgContainer: '#1e293b', // Slate-800
        boxShadowTertiary: 'none',
    },
    Table: {
        borderRadiusLG: 12,
        headerBg: '#1e293b', // Slate-800
        headerColor: '#cbd5e1', // Slate-300
        headerSplitColor: 'transparent',
    },
    Layout: {
        colorBgHeader: 'rgba(15, 23, 42, 0.8)', // Slate-900 glass
        colorBgBody: '#0f172a', // Slate-900
        siderBg: '#020617', // Slate-950
    },
    Menu: {
        colorItemBg: 'transparent',
        colorItemText: '#94a3b8', // Slate-400
        colorItemTextSelected: '#ffffff',
        colorItemBgSelected: '#007AFF',
        itemBorderRadius: 8,
        itemMarginInline: 8,
    }
};

export const getComponentTheme = (isDark) => {
    return isDark ? darkComponentTheme : lightComponentTheme;
};
// Backward compatibility for now (though we should update App.jsx)
export const componentTheme = lightComponentTheme;

export const customColors = {
    primary: '#007AFF',
    secondary: '#0f172a',
    accent: '#06b6d4',
    background: '#f1f5f9',
    white: '#ffffff',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',
};
