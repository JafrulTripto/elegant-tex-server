import React from 'react';
import { ContextProvider, useStateContext } from "./contexts/ContextProvider.jsx";
import { ConfigProvider, theme } from "antd";
import { themeToken, getComponentTheme } from "./theme";
import { ToastContainer } from "react-toastify";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";

const AppContent = () => {
    const { darkMode } = useStateContext();

    // Sync body background with theme
    React.useEffect(() => {
        const bodyColor = darkMode ? '#0f172a' : '#f1f5f9';
        document.body.style.backgroundColor = bodyColor;
        // Optionally toggle a class for Tailwind 'darkMode: class'
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: themeToken,
                components: getComponentTheme(darkMode)
            }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={darkMode ? "dark" : "colored"}
            />
            <RouterProvider router={router} />
        </ConfigProvider>
    );
};

const App = () => {
    return (
        <ContextProvider>
            <AppContent />
        </ContextProvider>
    );
};

export default App;
