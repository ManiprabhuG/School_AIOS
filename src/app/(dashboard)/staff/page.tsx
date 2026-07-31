'use client';

import React, { useState } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { useAuthStore } from '@/store/auth-store';
import { Staff, UserRole, User } from '@/types';
import { DataTable, Column } from '@/components/crud/DataTable';
import { CrudModal, FieldConfig } from '@/components/crud/CrudModal';
import { ImportModal } from '@/components/crud/ImportModal';
import { AuditLogViewer } from '@/components/crud/AuditLogViewer';
import { ConfirmDialog } from '@/components/crud/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { Users, Phone, Mail, Award, Briefcase, DollarSign, Calendar } from 'lucide-react';

export default function StaffManagementPage() {
  const {
    staff,
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; permanent: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/staff')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          useCrudStore.setState({ staff: res.data });
        }
      })
      .catch((err) => console.error('Failed to load staff from DB:', err));
  }, []);


  const staffFields: FieldConfig[] = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'username', label: 'User Login ID', type: 'text' },
    { name: 'password', label: 'Security Password', type: 'text' },
    { name: 'email', label: 'Email Address', type: 'email' },
    {
      name: 'role',
      label: 'Role & Responsibilities',
      type: 'select',
      options: [
        { label: 'Teacher', value: 'Teacher' },
        { label: 'Vice Principal', value: 'Vice Principal' },
        { label: 'Principal', value: 'Principal' },
        { label: 'Accountant', value: 'Accountant' },
        { label: 'HR', value: 'HR' },
        { label: 'Librarian', value: 'Librarian' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Inventory Manager', value: 'Inventory Manager' },
        { label: 'Transport Manager', value: 'Transport Manager' },
      ],
    },
    {
      name: 'department',
      label: 'Academic / Admin Department',
      type: 'select',
      options: [
        { label: 'Science Department', value: 'Science' },
        { label: 'Mathematics Department', value: 'Mathematics' },
        { label: 'English & Languages', value: 'English' },
        { label: 'Administration & Accounts', value: 'Administration' },
        { label: 'Primary Wing', value: 'Primary' },
        { label: 'Sports & PE', value: 'Sports' },
      ],
    },
    { name: 'designation', label: 'Job Designation / Title', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'phone' },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'qualification', label: 'Highest Educational Qualification', type: 'text' },
    { name: 'experienceYears', label: 'Experience (Years)', type: 'number' },
    { name: 'salary', label: 'Monthly Base Salary (₹)', type: 'number' },
    {
      name: 'status',
      label: 'Employment Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'On Leave', value: 'On Leave' },
      ],
    },
  ];

  const columns: Column<Staff>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt={s.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
            <p className="text-[11px] text-blue-600 font-semibold">{s.empId} • {s.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (s) => (
        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
          {s.role}
        </span>
      ),
    },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'phone', header: 'Contact Phone' },
    {
      key: 'salary',
      header: 'Monthly Salary',
      sortable: true,
      render: (s) => <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(s.salary)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            s.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : s.status === 'On Leave'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {s.status}
        </span>
      ),
    },
  ];

  const handleSaveStaff = async (data: Record<string, any>, saveAndNew?: boolean) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const usernameVal = data.username || data.email?.split('@')[0] || data.firstName?.toLowerCase();
    const pwdVal = data.password || `${usernameVal}123`;

    if (editingStaff) {
      updateRecord('staff', editingStaff.id, {
        ...data,
        name: fullName,
      });
      updateUserAccount(editingStaff.id, {
        name: fullName,
        username: usernameVal,
        passwordHash: pwdVal,
        email: data.email,
        role: data.role as UserRole,
        phone: data.phone,
        status: data.status,
      });
      try {
        await fetch('/api/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStaff.id, ...data, name: fullName }),
        });
      } catch (err) {
        console.error('Failed to update staff in database:', err);
      }
      setEditingStaff(null);
    } else {
      const newStaff: Staff = {
        id: `stf-${Date.now()}`,
        empId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        firstName: data.firstName,
        lastName: data.lastName,
        name: fullName,
        role: data.role as UserRole,
        department: data.department,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
        qualification: data.qualification || 'Graduate',
        experienceYears: Number(data.experienceYears) || 3,
        salary: Number(data.salary) || 45000,
        photo: data.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: data.status || 'Active',
      };
      addRecord('staff', newStaff);

      const newUserObj: User = {
        id: newStaff.id,
        name: fullName,
        username: usernameVal,
        email: data.email,
        role: data.role as UserRole,
        avatar: newStaff.photo,
        phone: data.phone,
        status: data.status || 'Active',
        passwordHash: pwdVal,
        lastLogin: 'Never',
      };
      addUserAccount(newUserObj);

      try {
        await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStaff),
        });
      } catch (err) {
        console.error('Failed to save staff to database:', err);
      }

      if (!saveAndNew) setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Staff & Faculty Management"
        subtitle="Teachers, Office Staff, HR, Drivers, Conductors & Salary CRUD"
        icon={<Users className="w-6 h-6" />}
        columns={columns}
        data={staff}
        addLabel="Add Staff Member"
        exportFilename="ABS_Staff_List"
        filterOptions={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { label: 'Teacher', value: 'Teacher' },
              { label: 'Accountant', value: 'Accountant' },
              { label: 'Transport Manager', value: 'Transport Manager' },
              { label: 'Librarian', value: 'Librarian' },
              { label: 'HR', value: 'HR' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'On Leave', value: 'On Leave' },
              { label: 'Resigned', value: 'Resigned' },
            ],
          },
        ]}
        statusUpdateOptions={{
          field: 'status',
          label: 'Status',
          values: ['Active', 'On Leave', 'Resigned'],
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={(stf) => setEditingStaff(stf)}
        onViewClick={(stf) => setViewingStaff(stf)}
        onSoftDeleteClick={(stf) => setConfirmDelete({ id: stf.id, name: stf.name, permanent: false })}
        onRestoreClick={(stf) => restoreRecord('staff', stf.id)}
        onPermanentDeleteClick={(stf) => setConfirmDelete({ id: stf.id, name: stf.name, permanent: true })}
        onBulkDelete={(ids, soft) => bulkDeleteRecords('staff', ids, soft)}
        onBulkStatusUpdate={(ids, field, val) => bulkUpdateStatus('staff', ids, field, val)}
        onImportClick={() => setIsImportOpen(true)}
        onAuditLogsClick={() => setIsAuditOpen(true)}
      />

      {/* Add / Edit Modal */}
      <CrudModal
        isOpen={isAddModalOpen || Boolean(editingStaff)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStaff(null);
        }}
        title="Staff Member"
        fields={staffFields}
        initialData={editingStaff ? { ...editingStaff } : null}
        onSave={handleSaveStaff}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Staff"
        onImport={(rows) => importRecords('staff', rows)}
      />

      {/* Audit Log Modal */}
      <AuditLogViewer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        moduleName="staff"
        auditLogs={auditLogs}
      />

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
          title={confirmDelete.permanent ? 'Permanently Delete Staff Member' : 'Move Staff Record to Trash'}
          message={`Are you sure you want to ${
            confirmDelete.permanent ? 'permanently delete' : 'soft delete'
          } ${confirmDelete.name}?`}
          confirmLabel={confirmDelete.permanent ? 'Permanent Delete' : 'Move to Trash'}
          onConfirm={async () => {
            if (confirmDelete.permanent) {
              permanentDeleteRecord('staff', confirmDelete.id);
              try {
                await fetch(`/api/staff?id=${confirmDelete.id}`, { method: 'DELETE' });
              } catch (err) {
                console.error('Failed to delete staff from database:', err);
              }
            } else {
              softDeleteRecord('staff', confirmDelete.id);
            }
          }}
        />
      )}

      {/* View Staff Dossier Drawer */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Staff HR Dossier & Service Record
              </h3>
              <button onClick={() => setViewingStaff(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4">
                <img
                  src={viewingStaff.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt={viewingStaff.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/20"
                />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{viewingStaff.name}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  {viewingStaff.role}
                </span>
                <p className="text-xs text-slate-400">ID: {viewingStaff.empId}</p>
              </div>

              <div className="col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Department</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStaff.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Designation</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStaff.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Qualification</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStaff.qualification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Experience</span>
                    <strong className="text-slate-800 dark:text-slate-200">{viewingStaff.experienceYears} Years</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> {viewingStaff.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> {viewingStaff.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Joined: {viewingStaff.joiningDate}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block">Monthly Payroll Salary</span>
                    <strong className="text-emerald-600 font-extrabold text-sm">
                      {formatCurrency(viewingStaff.salary)}
                    </strong>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {viewingStaff.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
