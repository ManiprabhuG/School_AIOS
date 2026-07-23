'use client';

import React, { useState } from 'react';
import { initialStudents } from '@/lib/mock-data';
import { Student, ClassName, Section } from '@/types';
import { exportToCSV, formatCurrency } from '@/lib/utils';
import {
  GraduationCap,
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  ArrowUpRight,
  Sparkles,
  X,
  Phone,
  Mail,
  MapPin,
  Bus,
} from 'lucide-react';

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    className: '10th' as ClassName,
    section: 'A' as Section,
    dob: '2010-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    totalFees: 65000,
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.includes(search);
    const matchesClass = selectedClass === 'All' || s.className === selectedClass;
    const matchesFee = selectedFeeStatus === 'All' || s.feeStatus === selectedFeeStatus;
    return matchesSearch && matchesClass && matchesFee;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      admissionNo: `ABS-2026-0${students.length + 10}`,
      rollNo: `${100 + students.length + 1}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      className: formData.className,
      section: formData.section,
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      address: formData.address,
      feeStatus: 'Pending',
      totalFees: formData.totalFees,
      paidFees: 0,
      dueFees: formData.totalFees,
      attendancePercent: 100,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
  };

  const handleExport = () => {
    exportToCSV(
      'ABS_Students_List',
      filteredStudents.map((s) => ({
        AdmissionNo: s.admissionNo,
        RollNo: s.rollNo,
        Name: s.name,
        Class: s.className,
        Section: s.section,
        Gender: s.gender,
        DOB: s.dob,
        FatherName: s.fatherName,
        ParentPhone: s.parentPhone,
        FeeStatus: s.feeStatus,
        TotalFees: s.totalFees,
        PaidFees: s.paidFees,
        DueFees: s.dueFees,
        AttendancePercent: s.attendancePercent,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Management</h1>
              <p className="text-xs text-slate-500">LKG to 12th Standard Enrolments & Academic Records</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Register New Student
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, admission no..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Classes</option>
              {['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Fee Status:</span>
            <select
              value={selectedFeeStatus}
              onChange={(e) => setSelectedFeeStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Admission No</th>
                <th className="p-4">Class & Sec</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Parent Phone</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Fee Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={student.photo} alt={student.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{student.name}</p>
                        <p className="text-[11px] text-slate-400">{student.gender} • DOB: {student.dob}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{student.admissionNo}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                      {student.className}-{student.section}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">#{student.rollNo}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{student.parentPhone}</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{student.attendancePercent}%</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        student.feeStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : student.feeStatus === 'Partial'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Student ERP Dossier Profile
              </h3>
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2 border-r border-slate-100 dark:border-slate-800 pr-4">
                <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/20" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedStudent.name}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold">
                  Class {selectedStudent.className}-{selectedStudent.section}
                </span>
                <p className="text-xs text-slate-400">Roll #{selectedStudent.rollNo}</p>
              </div>

              <div className="col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">Admission Number</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedStudent.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Blood Group</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Father Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mother Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.motherName}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> {selectedStudent.parentPhone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> {selectedStudent.parentEmail}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> {selectedStudent.address}
                  </div>
                  {selectedStudent.busRoute && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Bus className="w-3.5 h-3.5 text-amber-500" /> {selectedStudent.busRoute}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <div>
                    <span className="text-slate-400 block">Total Annual Fee</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(selectedStudent.totalFees)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Due Fees</span>
                    <strong className="text-rose-600 font-bold">{formatCurrency(selectedStudent.dueFees)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Register New ABS Student</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value as ClassName })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Father Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-500 transition-all"
              >
                Submit Admission Form
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
