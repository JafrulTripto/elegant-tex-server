import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider} from 'react-router-dom';
import './index.css'
import router from "./router.jsx";
import {ContextProvider} from "./contexts/ContextProvider";
import 'antd/dist/reset.css';
import {ConfigProvider} from "antd";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ContextProvider>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <RouterProvider router={router}/>
    </ConfigProvider>
  </ContextProvider>
)
