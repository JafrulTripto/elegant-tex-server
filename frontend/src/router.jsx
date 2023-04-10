import {createBrowserRouter, Navigate} from "react-router-dom";
import Login from "./views/Login.jsx";
import Dashboard from "./views/Dashboard.jsx";
import DefaultLayout from "./components/Layouts/DefaultLayout.jsx";
import GuestLayout from "./components/Layouts/GuestLayout.jsx";
import NotFound from "./views/NotFound";
import Orders from "./views/Orders.jsx";
import Settings from "./views/Settings.jsx";
import RoleSettings from "./views/RoleSettings.jsx";
import Users from "./views/Users.jsx";
import UserForm from "./views/UserForm.jsx";
import PermissionSettings from "./views/PermissionSettings.jsx";
import ProductSettings from "./views/ProductSettings.jsx";
import MarketplaceSettings from "./views/MarketplaceSettings.jsx";
import OrderFrom from "./views/OrderFrom.jsx";
import Order from "./views/Order.jsx";
import Merchants from "./views/Merchants";
import MerchantForm from "./views/MerchantForm";
import Error from "./views/Error";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout/>,
    children:[
      {
        path: '/',
        element: <Dashboard/>
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/merchants',
        element: <Merchants/>
      },
      {
        path: '/merchants/merchantForm',
        element: <MerchantForm/>
      },
      {
        path: '/orders',
        element: <Orders/>
      },
      {
        path: '/orders/orderForm',
        element: <OrderFrom/>
      },
      {
        path: '/orders/:id',
        element: <Order/>
      },
      {
        path: '/settings',
        element: <Settings/>,
      },
      {
        path: '/users',
        element: <Users/>,
      },
      {
        path: '/users/userForm',
        element: <UserForm/>,
      },
      {
        path: '/settings/roleSettings',
        element: <RoleSettings/>
      },
      {
        path: '/settings/permissionSettings',
        element: <PermissionSettings/>
      },
      {
        path: '/settings/productSettings',
        element: <ProductSettings/>
      },
      {
        path: '/settings/marketplaceSettings',
        element: <MarketplaceSettings/>
      },
      {
        path: '/notFound',
        element: <NotFound/>
      }
    ]
  },
  {
    path:'/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/error',
        element: <Error/>
      }
    ]
  },
  {
    path: '*',
    element: <NotFound/>
  }

]);

export default router;
