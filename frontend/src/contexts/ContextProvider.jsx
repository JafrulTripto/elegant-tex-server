import { createContext, useContext, useState, useCallback } from "react";

const StateContext = createContext({
  user: null,
  token: null,
  roles: [],
  permissions: [],
  setUser: () => { },
  setToken: () => { },
  setRoles: () => { },
  setPermissions: () => { },
  setMessage: () => { }
})

export const ContextProvider = ({ children }) => {

  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [message, setMessage] = useState("");
  const [darkMode, _setDarkMode] = useState(localStorage.getItem("DARK_MODE") === 'true');

  const setDarkMode = useCallback((isDark) => {
    _setDarkMode(isDark);
    localStorage.setItem("DARK_MODE", isDark);
  }, []);

  const setToken = useCallback((token, expireTime) => {
    _setToken(token);
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('TOKEN_EXPIRATION', new Date(Date.now() + expireTime * 1000).toString());
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('TOKEN_EXPIRATION');
    }
  }, []);

  return (
    <StateContext.Provider value={{
      user,
      token,
      roles,
      permissions,
      message,
      setUser,
      setToken,
      setRoles,
      setPermissions,
      setMessage,
      darkMode,
      setDarkMode
    }}>
      {children}
    </StateContext.Provider>
  )
}
export const useStateContext = () => useContext(StateContext);
