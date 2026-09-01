export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}
