import { Navigate } from 'react-router-dom';

import { getAccessToken } from '../auth/authStorage';

export function DefaultRoute() {
  return <Navigate to={getAccessToken() ? '/twin' : '/login'} replace />;
}
