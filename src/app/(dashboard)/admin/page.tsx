'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { useAuthStore } from '@/store/auth-store';
import { User, UserRole, RolePermission } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { ShieldCheck, Key, UserPlus, Lock, CheckSquare, XSquare } from 'lucide-react';

export default function AdminManagementPage() {
  const {
    admins,
    rolePermissions,
    auditLogs,
    addRecord,
    updateRecord,
    softDeleteRecord,
    restoreRecord,
    permanentDeleteRecord,
    bulkDeleteRecords,
    bulkUpdateStatus,
    importRecords,
  } = useCrudStore();

  const { addUserAccount, updateUserAccount } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'admins' | 'roles'>('admins');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<User | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  const adminFields: FieldConfig[] = [
    { name: 'name', label: 'Full User Name', type: 'text' },
    { name: 'username', label: 'User Login ID', type: 'text' },
    { name: 'password', label: 'Security Password', type: 'text' },
    { name: 'email', label: 'Login Email Address', type: 'email' },
    {
      name: 'role',
      label: 'Assigned Role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'Super Admin' },
        { label: 'Principal', value: 'Principal' },
        { label: 'Vice Principal', value: 'Vice Principal' },
        { label: 'Admin', value: 'Admin' },
        { label: 'Accountant', value: 'Accountant' },
        { label: 'HR', value: 'HR' },
        { label: 'Transport Manager', value: 'Transport Manager' },
      ],
    },
    {
      name: 'status',
      label: 'Account Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Admin User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={u.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{u.name}</p>
            <p className="text-[11px] text-indigo-500 font-semibold">ID: {u.username || u.email.split('@')[0]}</p>
            <p className="text-[10px] text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => (
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
          {u.role}
        </span>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'lastLogin', header: 'Last Active Login' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            u.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {u.status}
        </span>
      ),
    },
  ];

  const handleSaveAdmin = (data: Record<string, any>, saveAndNew?: boolean) => {
    const pwdVal = data.password || (editingAdmin ? editingAdmin.passwordHash : `${data.username || 'user'}123`);
    const usernameVal = data.username || data.email?.split('@')[0] || 'admin';

    if (editingAdmin) {
      const updatedObj = {
        ...data,
        passwordHash: pwdVal,
      };
      updateRecord('admins', editingAdmin.id, updatedObj);
      updateUserAccount(editingAdmin.id, {
        name: data.name,
        username: usernameVal,
        passwordHash: pwdVal,
        email: data.email,
        role: data.role as UserRole,
        phone: data.phone,
        status: data.status,
      });
      setEditingAdmin(null);
    } else {
      const newAdmin: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        username: usernameVal,
        passwordHash: pwdVal,
        email: data.email,
        role: data.role as UserRole,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: data.phone || '+91 98765 00000',
        status: data.status || 'Active',
        lastLogin: 'Never',
      };
      addRecord('admins', newAdmin);
      addUserAccount(newAdmin);
      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'admins' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Admin User Accounts
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'roles' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Role Permission Matrix
        </button>
      </div>

      {activeTab === 'admins' ? (
        <DataTable
          title="Admin Accounts & Privileges"
          subtitle="Super Admins, Principals, Accountants, HR & System Access Control"
          icon={<ShieldCheck className="w-6 h-6" />}
          columns={columns}
          data={admins}
          addLabel="Create Admin User"
          exportFilename="ABS_Admin_Users"
          filterOptions={[
            {
              key: 'role',
              label: 'Role',
              options: [
                { label: 'Super Admin', value: 'Super Admin' },
                { label: 'Principal', value: 'Principal' },
                { label: 'Accountant', value: 'Accountant' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ],
            },
          ]}
          statusUpdateOptions={{
            field: 'status',
            label: 'Account Status',
            values: ['Active', 'Inactive'],
          }}
          onAddClick={() => setIsAddModalOpen(true)}
          onEditClick={(u) => setEditingAdmin(u)}
          onSoftDeleteClick={(u) => setConfirmDelete({ id: u.id, name: u.name, permanent: false })}
          onRestoreClick={(u) => restoreRecord('admins', u.id)}
          onPermanentDeleteClick={(u) => setConfirmDelete({ id: u.id, name: u.name, permanent: true })}
          onBulkDelete={(ids, soft) => bulkDeleteRecords('admins', ids, soft)}
          onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('admins', ids, field, val)}
          onImportClick={() => setIsImportOpen(true)}
          onAuditLogsClick={() => setIsAuditOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Role Permission Matrix</h2>
            <p className="text-xs text-slate-500">Configure Create, Read, Update, Delete & Export privileges for each ERP role</p>
          </div>

          <div className="space-y-6">
            {rolePermissions.map((rp) => (
              <div key={rp.role} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{rp.role}</h3>
                    <p className="text-xs text-slate-500">{rp.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full">Active Matrix</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="p-2">Module</th>
                        <th className="p-2 text-center">Create</th>
                        <th className="p-2 text-center">Read</th>
                        <th className="p-2 text-center">Update</th>
                        <th className="p-2 text-center">Delete</th>
                        <th className="p-2 text-center">Export</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                      {rp.permissions.map((p) => (
                        <tr key={p.module}>
                          <td className="p-2 text-slate-800 dark:text-slate-200">{p.module}</td>
                          <td className="p-2 text-center">
                            {p.create ? <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" /> : <XSquare className="w-4 h-4 text-slate-300 mx-auto" />}
                          </td>
                          <td className="p-2 text-center">
                            {p.read ? <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" /> : <XSquare className="w-4 h-4 text-slate-300 mx-auto" />}
                          </td>
                          <td className="p-2 text-center">
                            {p.update ? <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" /> : <XSquare className="w-4 h-4 text-slate-300 mx-auto" />}
                          </td>
                          <td className="p-2 text-center">
                            {p.delete ? <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" /> : <XSquare className="w-4 h-4 text-slate-300 mx-auto" />}
                          </td>
                          <td className="p-2 text-center">
                            {p.export ? <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" /> : <XSquare className="w-4 h-4 text-slate-300 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingAdmin)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAdmin(null);
        }}
        title="Admin User Account"
        fields={adminFields}
        initialData={editingAdmin ? { ...editingAdmin } : null}
        onSave={handleSaveAdmin}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Admin Users"
        onImport={(rows) => importRecords('admins', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="admins"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete User' : 'Move User to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={() => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('admins', confirmDelete.id);
            } else {
              softDeleteRecord('admins', confirmDelete.id);
            }
          }}
        />
      )}
    </div>
  );
}
