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
import { ShieldCheck, Key, UserPlus, Lock, CheckSquare, XSquare, Plus, Trash2, Save, Check, X, RefreshCw } from 'lucide-react';

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

  // Role Matrix Management State
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);
  const [matrixSaveSuccess, setMatrixSaveSuccess] = useState(false);

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [targetRoleForModule, setTargetRoleForModule] = useState<string>('');
  const [newModuleName, setNewModuleName] = useState('');

  // Toggle Action Handler (View/Read, Create, Edit/Update, Delete, Export)
  const handleTogglePermission = (
    roleName: string,
    moduleName: string,
    actionKey: 'create' | 'read' | 'update' | 'delete' | 'export'
  ) => {
    const updated = rolePermissions.map((rp) => {
      if (rp.role !== roleName) return rp;
      const updatedPerms = rp.permissions.map((p) => {
        if (p.module !== moduleName) return p;
        return {
          ...p,
          [actionKey]: !p[actionKey],
        };
      });
      return {
        ...rp,
        permissions: updatedPerms,
      };
    });

    useCrudStore.setState({ rolePermissions: updated });
  };

  // Save Role Matrix to DB API Handler
  const handleSaveRoleMatrixToDb = async () => {
    setIsSavingMatrix(true);
    setMatrixSaveSuccess(false);
    try {
      await fetch('/api/auth/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolePermissions),
      });
      setMatrixSaveSuccess(true);
      setTimeout(() => setMatrixSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save role permissions to DB:', err);
    } finally {
      setIsSavingMatrix(false);
    }
  };

  // Add Custom Role Profile
  const handleCreateRoleProfile = () => {
    if (!newRoleName.trim()) return;
    const roleExists = rolePermissions.some((r) => r.role.toLowerCase() === newRoleName.trim().toLowerCase());
    if (roleExists) {
      alert('Role profile already exists!');
      return;
    }

    const newProfile: RolePermission = {
      role: newRoleName.trim() as any,
      description: newRoleDescription.trim() || 'Custom ERP Role Profile',
      permissions: [
        { module: 'Students', create: false, read: true, update: false, delete: false, export: false },
        { module: 'Attendance', create: true, read: true, update: true, delete: false, export: true },
        { module: 'Announcements', create: false, read: true, update: false, delete: false, export: false },
      ],
    };

    const updated = [...rolePermissions, newProfile];
    useCrudStore.setState({ rolePermissions: updated });
    setIsAddRoleModalOpen(false);
    setNewRoleName('');
    setNewRoleDescription('');
  };

  // Add Custom Module to Role
  const handleAddModuleToRole = () => {
    if (!newModuleName.trim() || !targetRoleForModule) return;

    const updated = rolePermissions.map((rp) => {
      if (rp.role !== targetRoleForModule) return rp;
      const exists = rp.permissions.some((p) => p.module.toLowerCase() === newModuleName.trim().toLowerCase());
      if (exists) return rp;
      return {
        ...rp,
        permissions: [
          ...rp.permissions,
          { module: newModuleName.trim(), create: true, read: true, update: true, delete: false, export: true },
        ],
      };
    });

    useCrudStore.setState({ rolePermissions: updated });
    setIsAddModuleModalOpen(false);
    setNewModuleName('');
    setTargetRoleForModule('');
  };

  // Delete Module from Role
  const handleDeleteModuleFromRole = (roleName: string, moduleName: string) => {
    const updated = rolePermissions.map((rp) => {
      if (rp.role !== roleName) return rp;
      return {
        ...rp,
        permissions: rp.permissions.filter((p) => p.module !== moduleName),
      };
    });
    useCrudStore.setState({ rolePermissions: updated });
  };

  // Delete Entire Role Profile
  const handleDeleteRoleProfile = (roleName: string) => {
    if (roleName === 'Super Admin') {
      alert('Super Admin role matrix cannot be deleted!');
      return;
    }
    const updated = rolePermissions.filter((rp) => rp.role !== roleName);
    useCrudStore.setState({ rolePermissions: updated });
  };

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
        { label: 'Teacher', value: 'Teacher' },
        { label: 'Accountant', value: 'Accountant' },
        { label: 'HR', value: 'HR' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Librarian', value: 'Librarian' },
        { label: 'Transport Manager', value: 'Transport Manager' },
        { label: 'Inventory Manager', value: 'Inventory Manager' },
        { label: 'Parent', value: 'Parent' },
        { label: 'Student', value: 'Student' },
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
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Granular Role Permission Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Configure exact View (Read), Create, Edit (Update), Delete & Export privileges for each user role in MySQL Database
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddRoleModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all border border-indigo-200/50 dark:border-indigo-800/50"
              >
                <Plus className="w-4 h-4" /> Add Role Profile
              </button>
              <button
                onClick={handleSaveRoleMatrixToDb}
                disabled={isSavingMatrix}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isSavingMatrix ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSavingMatrix ? 'Saving to Database...' : 'Save Matrix to Database'}
              </button>
            </div>
          </div>

          {matrixSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4" /> Role permission matrix updated & saved to MySQL database successfully!
            </div>
          )}

          <div className="space-y-6">
            {rolePermissions.map((rp) => (
              <div key={rp.role} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      {rp.role}
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] rounded-full uppercase tracking-wider">
                        {rp.permissions.length} Modules Configured
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{rp.description || 'Configured ERP Role Privileges'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetRoleForModule(rp.role);
                        setIsAddModuleModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                    {rp.role !== 'Super Admin' && (
                      <button
                        onClick={() => handleDeleteRoleProfile(rp.role)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200"
                        title="Delete Role Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Module Name</th>
                        <th className="p-3 text-center">View (Read)</th>
                        <th className="p-3 text-center">Create (Add)</th>
                        <th className="p-3 text-center">Edit (Update)</th>
                        <th className="p-3 text-center">Delete (Remove)</th>
                        <th className="p-3 text-center">Export (Report)</th>
                        <th className="p-3 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                      {rp.permissions.map((p) => (
                        <tr key={p.module} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-900 dark:text-slate-100 font-extrabold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            {p.module}
                          </td>

                          {/* View (Read) Option */}
                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.read}
                                onChange={() => handleTogglePermission(rp.role, p.module, 'read')}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                              />
                            </label>
                          </td>

                          {/* Create Option */}
                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.create}
                                onChange={() => handleTogglePermission(rp.role, p.module, 'create')}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                              />
                            </label>
                          </td>

                          {/* Edit (Update) Option */}
                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.update}
                                onChange={() => handleTogglePermission(rp.role, p.module, 'update')}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                              />
                            </label>
                          </td>

                          {/* Delete Option */}
                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.delete}
                                onChange={() => handleTogglePermission(rp.role, p.module, 'delete')}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                              />
                            </label>
                          </td>

                          {/* Export Option */}
                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.export}
                                onChange={() => handleTogglePermission(rp.role, p.module, 'export')}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                              />
                            </label>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteModuleFromRole(rp.role, p.module)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete Module from Role"
                            >
                              <X className="w-4 h-4" />
                            </button>
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

      {/* Add Role Profile Modal */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Create New Role Profile</h3>
              <button onClick={() => setIsAddRoleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Title / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Librarian, Academic Coordinator, Vice Principal"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of duties and permission scope for this role"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoleProfile}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                Create Role Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module to Role Modal */}
      {isAddModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Add Module to {targetRoleForModule}</h3>
              <button onClick={() => setIsAddModuleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Module Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Library, Payroll, Hostel, Transport, Reports"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModuleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddModuleToRole}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
