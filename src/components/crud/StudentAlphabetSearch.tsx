'use client';

import React, { useState, useMemo } from 'react';
import { useCrudStore } from '@/store/crud-store';
import { Student } from '@/types';
import { Search, UserCheck, GraduationCap, Phone, CheckCircle2, Filter } from 'lucide-react';

interface StudentAlphabetSearchProps {
  onSelectStudent: (student: Student) => void;
  selectedStudentId?: string;
  placeholder?: string;
  className?: string;
}

const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export function StudentAlphabetSearch({
  onSelectStudent,
  selectedStudentId,
  placeholder = 'Type to search or click alphabet filter below...',
  className = '',
}: StudentAlphabetSearchProps) {
  const { students } = useCrudStore();
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const nameUpper = (s.name || `${s.firstName || ''} ${s.lastName || ''}`).trim().toUpperCase();
      const matchesLetter = selectedLetter === 'ALL' || nameUpper.startsWith(selectedLetter);

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.firstName && s.firstName.toLowerCase().includes(q)) ||
        (s.lastName && s.lastName.toLowerCase().includes(q)) ||
        (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.section && s.section.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.toLowerCase().includes(q));

      return matchesLetter && matchesQuery;
    });
  }, [students, selectedLetter, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  return (
    <div className={`space-y-3 relative ${className}`}>
      {/* Search Input Bar with Toggle */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-blue-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] hover:bg-blue-600/20 transition-all flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              <span>A-Z</span>
            </button>
          </div>
        </div>

        {/* Selected Student Banner Badge */}
        {selectedStudent && !isOpen && (
          <div className="mt-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={selectedStudent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={selectedStudent.name}
                className="w-8 h-8 rounded-lg object-cover shrink-0 ring-2 ring-blue-500/40"
              />
              <div className="truncate">
                <span className="font-extrabold text-blue-950 dark:text-blue-200 block truncate">{selectedStudent.name}</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300">
                  Adm: {selectedStudent.admissionNo} | Class: {selectedStudent.className}-{selectedStudent.section} | Roll: {selectedStudent.rollNo}
                </span>
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Pre-filled
            </span>
          </div>
        )}
      </div>

      {/* Alphabet Quick Filter Bar & Dropdown Results Container */}
      {isOpen && (
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-3 z-30 relative animate-in fade-in">
          {/* Alphabet Filter Row */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-slate-500">
              <span>Filter Student Name by Starting Letter:</span>
              {selectedLetter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedLetter('ALL')}
                  className="text-blue-600 hover:underline font-extrabold"
                >
                  Clear Letter Filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {ALPHABETS.map((letter) => {
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Matching List */}
          <div className="space-y-1 max-h-56 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 px-1 flex justify-between">
              <span>Matching Students ({filteredStudents.length})</span>
              <span>Click to auto-fill details</span>
            </div>

            {filteredStudents.length > 0 ? (
              filteredStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    onSelectStudent(st);
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={st.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 transition-colors">
                        {st.name}
                      </h4>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Adm: <strong>{st.admissionNo}</strong></span>
                        <span>Class: <strong>{st.className}-{st.section}</strong></span>
                        <span>Roll: <strong>{st.rollNo}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] group-hover:scale-105 transition-all shadow-xs"
                  >
                    Select & Auto-fill
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                No students found matching starting letter '{selectedLetter}' or query '{searchQuery}'.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
            >
              Close Dropdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
