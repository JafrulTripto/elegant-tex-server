import {createContext, useContext, useState} from "react";

const StateContext = createContext({
  user: null,
  token: null,
  roles:[],
  Permissions:[],
  setUser: () => {},
  setToken: () => {},
  setRoles: () => {},
  setPermissions:()=> {}
})

export const ContextProvider = ({children}) => {

  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token);
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
    }
  }

  return (
    <StateContext.Provider value={{
      user,
      token,
      roles,
      permissions,
      setUser,
      setToken,
      setRoles,
      setPermissions
    }}>
      {children}
    </StateContext.Provider>
  )
}
export const useStateContext = () => useContext(StateContext);
