import React, {useEffect} from 'react';
import {useStateContext} from "../../contexts/ContextProvider.jsx";


const Permission = (props) => {

  const { permissions } = useStateContext();

  const checkPermissions = () => {
    if (permissions) {
      if (permissions.indexOf(props.required) > -1) {
        return true;
      }

    }
    return false;
  }

  if (!props.required) {
    return props.children;
  }
  return (
    <>
      {checkPermissions() ? props.children : null}
    </>
  )
}

export default Permission
