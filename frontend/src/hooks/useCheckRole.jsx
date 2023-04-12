import { useEffect, useState } from 'react';

function useCheckRole(roles, userRoles) {
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    setHasRole(roles.some(role => userRoles.includes(role)));
  }, [roles, userRoles]);

  return hasRole;
}
