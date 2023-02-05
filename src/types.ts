export type RootStackParamList = {
  Signup: undefined;
  Signin: undefined;
};

export interface User {
  userId: string;
  email: string;
  name: string;
  password?: string;
}

export enum Collections {
  USERS = 'users',
}
