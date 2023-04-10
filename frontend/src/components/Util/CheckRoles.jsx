import React from 'react';
import {useStateContext} from "../../contexts/ContextProvider";

const CheckRoles = ({required, children}) => {

  const { roles } = useStateContext();
  const check = () => {
    if (roles) {
      if (roles.indexOf(required) > -1) {
        return true;
      }

    }
    return false;
  }

  if (!required) {
    return children;
  }
  return (
    <>
      {check() ? children : null}
    </>
  )
};

export default CheckRoles;
