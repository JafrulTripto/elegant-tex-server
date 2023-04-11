import React from 'react';
import {ContextProvider} from "./contexts/ContextProvider.jsx";
import {ConfigProvider} from "antd";
import {colors} from "./utils/Colors.js";
import {ToastContainer} from "react-toastify";
import {RouterProvider} from "react-router-dom";
import router from "./router.jsx";

const App = () => {
    return (
        <ContextProvider>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: colors.primary,
                        colorLink: colors.primary,
                        colorLinkHover: colors.primaryLight,
                        colorLinkActive: colors.primaryLight
                    },
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
                    theme="colored"
                />
                <RouterProvider router={router}/>
            </ConfigProvider>
        </ContextProvider>
    );
};

export default App;
