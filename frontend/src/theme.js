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

const baseToken = {
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
    // Explicit Light Mode Defaults (Slate Scale)
    colorTextBase: '#0f172a',    // Slate-900 (High contrast body text)
    colorTextHeading: '#1e293b', // Slate-800 (Headings)
    colorTextSecondary: '#64748b', // Slate-500 (Muted text)
    colorTextDescription: '#94a3b8', // Slate-400
};

export const getThemeToken = (isDark) => {
    if (isDark) {
        return {
            ...baseToken,
            colorTextBase: '#f8fafc', // Slate-50 for better readability
            colorTextHeading: '#ffffff',
            colorTextSecondary: '#cbd5e1', // Slate-300
            colorTextDescription: '#94a3b8', // Slate-400
            colorBorder: '#334155', // Slate-700
            colorSplit: '#334155',
            colorBgContainer: '#1e293b', // Slate-800
            colorBgElevated: '#1e293b', // Slate-800
            colorBgLayout: '#0f172a', // Slate-900
        };
    }
    return baseToken;
};

// Backward compatibility
export const themeToken = baseToken;

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
    InputNumber: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#f8fafc',
        colorBorder: '#e2e8f0',
    },
    DatePicker: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#f8fafc',
        colorBorder: '#e2e8f0',
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
        borderColor: '#475569', // Slate-600 for visibility
        colorText: '#e2e8f0', // Slate-200
    },
    Input: {
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
        borderRadius: 8,
        colorBgContainer: '#1e293b', // Slate-800
        colorBorder: '#334155', // Slate-700
    },
    InputNumber: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#1e293b',
        colorBorder: '#334155',
    },
    DatePicker: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#1e293b',
        colorBorder: '#334155',
    },
    Select: {
        controlHeight: 40,
        borderRadius: 8,
        colorBgContainer: '#1e293b', // Slate-800
        colorBorder: '#334155',
        optionSelectedBg: '#334155', // Slate-700
    },
    Card: {
        borderRadiusLG: 16,
        colorBgContainer: '#1e293b', // Slate-800
        boxShadowTertiary: 'none',
    },
    Divider: {
        colorSplit: '#334155', // Slate-700
    },
    Table: {
        borderRadiusLG: 12,
        headerBg: '#1e293b', // Slate-800
        headerColor: '#cbd5e1', // Slate-300
        headerSplitColor: 'transparent',
        bodySortBg: '#1e293b',
        borderColor: '#334155',
        colorBgContainer: '#1e293b', // Explicitly set body background
        rowHoverBg: '#334155', // Slate-700
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
        colorItemBgHover: 'rgba(255, 255, 255, 0.1)',
        colorItemTextHover: '#ffffff',
        itemBorderRadius: 8,
        itemMarginInline: 8,
        popupBg: '#1e293b', // Slate-800 for submenus
    },
    Switch: {
        handleBg: '#ffffff',
        colorPrimary: '#007AFF',
        colorPrimaryHover: '#005ec4',
    },
    Pagination: {
        itemBg: '#1e293b', // Slate-800
        itemActiveBg: '#334155', // Slate-700
    },
    Modal: {
        contentBg: '#1e293b', // Slate-800
        headerBg: '#1e293b',
        footerBg: '#1e293b',
    },
    Dropdown: {
        colorBgElevated: '#1e293b', // Slate-800
    },
    Popconfirm: {
        colorBgElevated: '#1e293b', // Slate-800
    },
    Message: {
        contentBg: '#1e293b', // Slate-800
    },
    Notification: {
        colorBgElevated: '#1e293b', // Slate-800
    },
    Segmented: {
        colorBgLayout: '#0f172a', // Slate-900 track
        colorBgElevated: '#334155', // Slate-700 selected item
        itemSelectedColor: '#ffffff'
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
