import {createContext} from 'react';
import {User} from '../types';

export interface AuthContextProp {
  initialized: boolean;
  user: User | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  processingSignup: boolean;
  processingSignin: boolean;
}
const AuthContext = createContext<AuthContextProp>({
  initialized: false,
  user: null,
  signup: async () => {},
  signin: async () => {},
  processingSignup: false,
  processingSignin: false,
});

export default AuthContext;
