// useRouteGuard.js
// Enforces presence of required location.state keys (e.g., booking data)

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useRouteGuard = (requiredKeys = [], fallback = '/') => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const missing = requiredKeys.some(key => !location.state?.[key]);
    if (missing) {
      navigate(fallback);
    }
  }, []);
};

export default useRouteGuard;
