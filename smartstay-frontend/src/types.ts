export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  role: Role;
}
