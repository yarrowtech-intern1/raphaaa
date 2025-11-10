// import React from 'react'
// import { useSelector } from 'react-redux'
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, role }) => {
//     const { user } = useSelector((state) => state.auth);

//     if(!user || (role && user.role !== role)) {
//         return <Navigate to='/login' replace />;
//     }
//   return children;
// }

// export default ProtectedRoute
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  // If role is defined
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
