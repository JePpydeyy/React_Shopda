import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = () => {
    setAuthChecked((prev) => !prev);
  };

  return (
    <AuthContext.Provider value={{ authChecked, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};