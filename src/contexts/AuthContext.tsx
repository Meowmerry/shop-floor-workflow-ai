import { createContext,  useState, useCallback, type ReactNode } from 'react';
import type { FactoryUser, AuthState } from '../types/auth';
import { FACTORY_USERS } from '../types/auth';

export interface AuthContextType extends AuthState {
  login: (user: FactoryUser) => void;
  loginByBadge: (badgeId: string) => boolean;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
  });

  const login = useCallback((user: FactoryUser) => {
    setAuthState({
      isAuthenticated: true,
      currentUser: user,
    });
  }, []);

  const loginByBadge = useCallback((badgeId: string): boolean => {
    const user = FACTORY_USERS.find((u) => u.badgeId === badgeId);
    if (user) {
      login(user);
      return true;
    }
    return false;
  }, [login]);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginByBadge,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

