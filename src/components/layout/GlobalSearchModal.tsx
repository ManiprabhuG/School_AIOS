'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useCrudStore } from '@/store/crud-store';
import { useRouter } from 'next/navigation';
import { Search, X, GraduationCap, Users, CreditCard, ShoppingBag, Truck, Boxes, ShoppingCart, BookOpen, Megaphone, ArrowRight, LayoutDashboard, Settings, FileText, Bus } from 'lucide-react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
  icon: React.ElementType;
}

export default function GlobalSearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const {
    students,
    staff,
    feePayments,
    purchases,
    suppliers,
    inventory,
    sales,
    exams,
    announcements,
    buses,
  } = useCrudStore();

  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  const results: SearchResult[] = [];
  const q = query.toLowerCase().trim();

  // Navigation pages list
  const pages = [
    { title: 'Dashboard Overview', subtitle: 'KPIs, Admissions & Financial Summaries', link: '/', icon: LayoutDashboard },
    { title: 'Student Management', subtitle: 'Student Directory, Admissions & Profiles', link: '/students', icon: GraduationCap },
    { title: 'Staff Directory', subtitle: 'Teaching & Non-Teaching Staff Profiles', link: '/staff', icon: Users },
    { title: 'Fee Management', subtitle: 'Collect Fees, Receipts & Fee Structure', link: '/fees', icon: CreditCard },
    { title: 'Examinations & Marks', subtitle: 'Exam Timetables, Hall Duty & Report Cards', link: '/examinations', icon: BookOpen },
    { title: 'Attendance Register', subtitle: 'Daily Student & Staff Attendance Calendar', link: '/attendance', icon: BookOpen },
    { title: 'Finance Ledger', subtitle: 'Income, Expenses & Bank Accounts', link: '/finance', icon: CreditCard },
    { title: 'Inventory Stock', subtitle: 'Assets, Uniforms, Books & Supplies', link: '/inventory', icon: Boxes },
    { title: 'Purchase Orders', subtitle: 'Procurement, Orders & Supplier Bills', link: '/purchases', icon: ShoppingBag },
    { title: 'Store Sales', subtitle: 'POS Invoicing & Direct Counter Sales', link: '/sales', icon: ShoppingCart },
    { title: 'Suppliers Directory', subtitle: 'Approved Vendors & Suppliers', link: '/suppliers', icon: Truck },
    { title: 'Bus & Transport', subtitle: 'Routes, Vehicles & Driver Allocations', link: '/bus', icon: Bus },
    { title: 'Announcements', subtitle: 'School Circulars & Parent Notifications', link: '/announcements', icon: Megaphone },
    { title: 'Reports & Analytics', subtitle: 'Financial & Academic PDF Exports', link: '/reports', icon: FileText },
    { title: 'System Settings', subtitle: 'School Profile, Logo & System Configurations', link: '/settings', icon: Settings },
  ];

  if (q.length > 0) {
    // 1. Search Navigation Pages
    pages.forEach((p, idx) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${idx}`,
          type: 'Navigation Module',
          title: p.title,
          subtitle: p.subtitle,
          link: p.link,
          icon: p.icon,
        });
      }
    });

    // 2. Search Students (Live Store)
    students.filter((s) => !s.isDeleted).forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.admissionNo?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.className?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          type: 'Student',
          title: `${s.name} (${s.admissionNo || 'N/A'})`,
          subtitle: `Class ${s.className || ''}-${s.section || ''} | Roll #${s.rollNo || ''} | Fee: ${s.feeStatus || ''}`,
          link: `/students?search=${encodeURIComponent(s.name)}`,
          icon: GraduationCap,
        });
      }
    });

    // 3. Search Staff (Live Store)
    staff.filter((st) => !st.isDeleted).forEach((st) => {
      if (
        st.name.toLowerCase().includes(q) ||
        st.empId?.toLowerCase().includes(q) ||
        st.department?.toLowerCase().includes(q) ||
        st.designation?.toLowerCase().includes(q)
      ) {
        results.push({
          id: st.id,
          type: 'Staff',
          title: `${st.name} (${st.empId || ''})`,
          subtitle: `${st.designation || 'Staff'} | Dept: ${st.department || 'General'}`,
          link: `/staff?search=${encodeURIComponent(st.name)}`,
          icon: Users,
        });
      }
    });

    // 4. Search Fee Payments (Live Store)
    feePayments.filter((f) => !f.isDeleted).forEach((f) => {
      if (
        f.studentName?.toLowerCase().includes(q) ||
        f.receiptNo?.toLowerCase().includes(q) ||
        f.paymentMode?.toLowerCase().includes(q)
      ) {
        results.push({
          id: f.id,
          type: 'Fee Receipt',
          title: `${f.receiptNo || 'Receipt'} - ${f.studentName || 'Student'}`,
          subtitle: `Collected: ₹${(f.amount || 0).toLocaleString('en-IN')} | Total: ₹${(f.totalAmount || f.amount || 0).toLocaleString('en-IN')} | Mode: ${f.paymentMode || 'Cash'}`,
          link: `/fees`,
          icon: CreditCard,
        });
      }
    });

    // 5. Search Purchase Orders (Live Store)
    purchases.filter((p) => !p.isDeleted).forEach((p) => {
      if (
        p.poNumber?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          type: 'Purchase Order',
          title: `${p.poNumber} - ${p.supplierName}`,
          subtitle: `Total: ₹${(p.totalAmount || 0).toLocaleString('en-IN')} | Status: ${p.status}`,
          link: `/purchases`,
          icon: ShoppingBag,
        });
      }
    });

    // 6. Search Suppliers (Live Store)
    suppliers.filter((sp) => !sp.isDeleted).forEach((sp) => {
      if (
        sp.name?.toLowerCase().includes(q) ||
        sp.companyName?.toLowerCase().includes(q) ||
        sp.category?.toLowerCase().includes(q)
      ) {
        results.push({
          id: sp.id,
          type: 'Supplier',
          title: sp.name,
          subtitle: `Category: ${sp.category || 'Vendor'} | Phone: ${sp.phone || 'N/A'}`,
          link: `/suppliers`,
          icon: Truck,
        });
      }
    });

    // 7. Search Inventory Items (Live Store)
    inventory.filter((inv) => !inv.isDeleted).forEach((inv) => {
      if (
        inv.name?.toLowerCase().includes(q) ||
        inv.itemCode?.toLowerCase().includes(q) ||
        inv.category?.toLowerCase().includes(q)
      ) {
        results.push({
          id: inv.id,
          type: 'Inventory Item',
          title: `${inv.name} [${inv.itemCode || ''}]`,
          subtitle: `Stock: ${inv.quantityInStock || 0} units | Category: ${inv.category || ''}`,
          link: `/inventory`,
          icon: Boxes,
        });
      }
    });

    // 8. Search Sales Invoices (Live Store)
    sales.filter((sl) => !sl.isDeleted).forEach((sl) => {
      if (
        sl.invoiceNo?.toLowerCase().includes(q) ||
        sl.customerName?.toLowerCase().includes(q) ||
        sl.itemName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: sl.id,
          type: 'Sales Invoice',
          title: `${sl.invoiceNo} - ${sl.customerName}`,
          subtitle: `Item: ${sl.itemName} | Amount: ₹${(sl.netAmount || 0).toLocaleString('en-IN')}`,
          link: `/sales`,
          icon: ShoppingCart,
        });
      }
    });

    // 9. Search Examinations (Live Store)
    exams.filter((ex) => !ex.isDeleted).forEach((ex) => {
      if (
        ex.name?.toLowerCase().includes(q) ||
        ex.className?.toLowerCase().includes(q) ||
        ex.examType?.toLowerCase().includes(q)
      ) {
        results.push({
          id: ex.id,
          type: 'Examination',
          title: ex.name,
          subtitle: `Class ${ex.className} | Type: ${ex.examType} | Status: ${ex.status}`,
          link: `/examinations`,
          icon: BookOpen,
        });
      }
    });

    // 10. Search Announcements (Live Store)
    announcements.filter((an) => !an.isDeleted).forEach((an) => {
      if (
        an.title?.toLowerCase().includes(q) ||
        an.content?.toLowerCase().includes(q)
      ) {
        results.push({
          id: an.id,
          type: 'Announcement',
          title: an.title,
          subtitle: `Target: ${an.targetAudience ? an.targetAudience.join(', ') : 'All'}`,
          link: `/announcements`,
          icon: Megaphone,
        });
      }
    });

    // 11. Search Bus Routes (Live Store)
    buses.filter((b) => !b.isDeleted).forEach((b) => {
      if (
        b.routeName?.toLowerCase().includes(q) ||
        b.busNo?.toLowerCase().includes(q) ||
        b.routeNo?.toLowerCase().includes(q) ||
        b.driverName?.toLowerCase().includes(q)
      ) {
        results.push({
          id: b.id,
          type: 'Bus Route',
          title: `${b.routeName} (${b.busNo || b.routeNo || 'Bus'})`,
          subtitle: `Driver: ${b.driverName || 'N/A'} | Phone: ${b.driverPhone || 'N/A'}`,
          link: `/bus`,
          icon: Bus,
        });
      }
    });
  }

  const handleSelect = (link: string) => {
    setSearchOpen(false);
    setQuery('');
    router.push(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Instant search students, staff, fees, exams, inventory, pages..."
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Prominent X Close Button */}
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close Search Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Type anything to search across all ABS School ERP modules...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No results matching &quot;{query}&quot;. Try searching for &quot;Aarav&quot;, &quot;10th&quot;, &quot;Raymond&quot;, or &quot;Blazer&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Search Results ({results.length})
              </div>
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.link)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
