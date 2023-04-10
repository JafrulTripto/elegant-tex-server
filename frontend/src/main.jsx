import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider} from 'react-router-dom';
import './index.css'
import router from "./router.jsx";
import {ContextProvider} from "./contexts/ContextProvider";
import 'antd/dist/reset.css';
import {ConfigProvider} from "antd";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {colors} from "./utils/Colors";

ReactDOM.createRoot(document.getElementById('root')).render(
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
)
