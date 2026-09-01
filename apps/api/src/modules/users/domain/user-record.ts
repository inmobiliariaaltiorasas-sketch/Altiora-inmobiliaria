export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}
