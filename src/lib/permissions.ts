import { UserRole } from '@/types';

export interface ModulePermission {
  module: string;
  allowedRoles: UserRole[];
}

export const modulePermissions: Record<string, UserRole[]> = {
  '/': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Accountant', 'Teacher', 'HR', 'Receptionist', 'Librarian', 'Transport Manager', 'Inventory Manager', 'Parent', 'Student'],
  '/students': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Teacher', 'HR', 'Receptionist'],
  '/staff': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'HR', 'Accountant'],
  '/attendance': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Teacher', 'HR', 'Receptionist', 'Student', 'Parent'],
  '/fees': ['Super Admin', 'Principal', 'Admin', 'Accountant', 'Parent', 'Student'],
  '/examinations': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Teacher', 'Parent', 'Student'],
  '/purchases': ['Super Admin', 'Principal', 'Admin', 'Inventory Manager', 'Accountant'],
  '/suppliers': ['Super Admin', 'Admin', 'Inventory Manager', 'Accountant'],
  '/sales': ['Super Admin', 'Admin', 'Accountant', 'Receptionist', 'Inventory Manager'],
  '/inventory': ['Super Admin', 'Admin', 'Inventory Manager', 'Accountant'],
  '/finance': ['Super Admin', 'Principal', 'Accountant', 'Admin'],
  '/bus': ['Super Admin', 'Admin', 'Transport Manager', 'Parent', 'Student'],
  '/announcements': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Teacher', 'HR', 'Receptionist', 'Librarian', 'Transport Manager', 'Inventory Manager', 'Parent', 'Student'],
  '/reports': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Accountant', 'HR', 'Inventory Manager', 'Transport Manager'],
  '/notifications': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Accountant', 'Teacher', 'HR', 'Receptionist', 'Librarian', 'Transport Manager', 'Inventory Manager', 'Parent', 'Student'],
  '/settings': ['Super Admin', 'Admin', 'Principal'],
  '/admin': ['Super Admin', 'Admin'],
  '/profile': ['Super Admin', 'Principal', 'Vice Principal', 'Admin', 'Accountant', 'Teacher', 'HR', 'Receptionist', 'Librarian', 'Transport Manager', 'Inventory Manager', 'Parent', 'Student'],
};

export function canAccessModule(role: UserRole, path: string): boolean {
  const allowed = modulePermissions[path];
  if (!allowed) return true;
  return allowed.includes(role);
}
