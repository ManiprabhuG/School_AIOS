'use client';

import React from 'react';
import { School, ShieldCheck, QrCode } from 'lucide-react';

import { useUIStore } from '@/store/ui-store';

export interface TemplateBranding {
  schoolName: string;
  schoolAddress: string;
  pincode?: string;
  gstin?: string;
  contactNumber: string;
  email: string;
  website: string;
  logoUrl?: string;
  academicYear: string;
  watermarkText?: string;
  authorizedSignatoryTitle: string;
}

export const defaultBranding: TemplateBranding = {
  schoolName: 'ABS MATRICULATION HIGHER SECONDARY SCHOOL',
  schoolAddress: '124, Education Boulevard, Knowledge City, Chennai, Tamil Nadu',
  pincode: '600001',
  gstin: '33AAAAA0000A1Z5',
  contactNumber: '+91 44 2800 1122 / +91 98765 43210',
  email: 'info@absschool.edu.in',
  website: 'www.absschool.edu.in',
  academicYear: '2025 - 2026',
  watermarkText: 'ABS SCHOOL OFFICIAL',
  authorizedSignatoryTitle: 'Authorized Finance Officer & Principal',
};

interface HeaderProps {
  branding?: TemplateBranding;
  documentTitle: string;
  docNumber: string;
  generatedDate?: string;
  generatedBy?: string;
  isThermal?: boolean;
}

export function PrintableHeader({
  branding: initialBranding,
  documentTitle,
  docNumber,
  generatedDate = new Date().toLocaleString('en-IN'),
  generatedBy = 'System Admin',
  isThermal = false,
}: HeaderProps) {
  const companyProfile = useUIStore((state) => state.companyProfile);

  const branding: TemplateBranding = {
    schoolName: companyProfile?.schoolName || initialBranding?.schoolName || defaultBranding.schoolName,
    schoolAddress: companyProfile?.address || initialBranding?.schoolAddress || defaultBranding.schoolAddress,
    pincode: companyProfile?.pincode || initialBranding?.pincode || defaultBranding.pincode,
    gstin: companyProfile?.gstin || initialBranding?.gstin || defaultBranding.gstin,
    contactNumber: companyProfile?.phone || initialBranding?.contactNumber || defaultBranding.contactNumber,
    email: companyProfile?.email || initialBranding?.email || defaultBranding.email,
    website: companyProfile?.website || initialBranding?.website || defaultBranding.website,
    logoUrl: companyProfile?.schoolLogo || initialBranding?.logoUrl || defaultBranding.logoUrl,
    academicYear: companyProfile?.academicYear || initialBranding?.academicYear || defaultBranding.academicYear,
    watermarkText: initialBranding?.watermarkText || defaultBranding.watermarkText,
    authorizedSignatoryTitle: companyProfile?.authorizedSignatoryTitle || initialBranding?.authorizedSignatoryTitle || defaultBranding.authorizedSignatoryTitle,
  };

  if (isThermal) {
    return (
      <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400 text-black">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" />
        )}
        <h2 className="font-extrabold text-sm uppercase tracking-tight">{branding.schoolName}</h2>
        <p className="text-[10px] leading-tight">{branding.schoolAddress} {branding.pincode ? `- ${branding.pincode}` : ''}</p>
        <p className="text-[10px]">Ph: {branding.contactNumber} {branding.gstin ? `| GSTIN: ${branding.gstin}` : ''}</p>
        <div className="pt-1 font-bold text-xs uppercase tracking-wide border-t border-slate-300 mt-1">
          *** {documentTitle} ***
        </div>
        <div className="text-[10px] flex justify-between pt-0.5">
          <span>No: {docNumber}</span>
          <span>Date: {generatedDate.split(',')[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-4 mb-4 border-b-4 border-slate-950 text-slate-950">
      <div className="flex items-center justify-between gap-4">
        {/* Left: School Logo & Title */}
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="School Logo" className="w-16 h-16 object-contain shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-extrabold shadow-sm shrink-0 border border-slate-950">
              <School className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-tight">
              {branding.schoolName}
            </h1>
            <p className="text-xs font-bold text-slate-900 max-w-lg leading-snug">
              {branding.schoolAddress} {branding.pincode ? ` - ${branding.pincode}` : ''}
            </p>
            <p className="text-xs font-black text-slate-950 mt-0.5">
              Phone: {branding.contactNumber} | Email: {branding.email} {branding.gstin ? ` | GSTIN: ${branding.gstin}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Academic Year & Doc Metadata */}
        <div className="text-right shrink-0">
          <div className="inline-block px-3.5 py-1.5 bg-slate-950 text-white text-xs font-black rounded-md uppercase tracking-wider mb-1.5 shadow-sm border border-slate-950">
            {documentTitle}
          </div>
          <p className="text-xs font-black text-slate-950">Doc #: {docNumber}</p>
          <p className="text-[11px] text-slate-950 font-extrabold">Academic Year: {branding.academicYear}</p>
          <p className="text-[10px] text-slate-800 font-bold">Issued: {generatedDate}</p>
        </div>
      </div>
    </div>
  );
}

interface FooterProps {
  branding?: TemplateBranding;
  generatedBy?: string;
  generatedDate?: string;
  isThermal?: boolean;
}

export function PrintableFooter({
  branding = defaultBranding,
  generatedBy = 'System Administrator',
  generatedDate = new Date().toLocaleString('en-IN'),
  isThermal = false,
}: FooterProps) {
  if (isThermal) {
    return (
      <div className="pt-2 mt-2 border-t-2 border-dashed border-slate-950 text-center text-[10px] text-slate-950 font-bold space-y-1">
        <p className="font-extrabold">Thank you! Keep this receipt for future reference.</p>
        <p className="text-[9px]">Generated By: {generatedBy} ({generatedDate})</p>
      </div>
    );
  }

  return (
    <div className="pt-6 mt-6 border-t-2 border-slate-950 text-slate-950">
      {/* Signature Section */}
      <div className="flex justify-between items-end mb-4 pt-2">
        <div className="text-left text-xs text-slate-900 space-y-1">
          <div className="w-24 h-12 border-2 border-dashed border-slate-950 rounded flex items-center justify-center text-[10px] text-slate-950 mb-1 bg-slate-50">
            <QrCode className="w-6 h-6 text-slate-950" />
          </div>
          <p className="font-extrabold text-slate-950">Scanned & Digitalized Receipt</p>
          <p className="text-[10px] text-slate-800 font-bold">Computer Generated Document</p>
        </div>

        <div className="text-right">
          <div className="w-52 h-14 border-b-2 border-slate-950 mb-1 flex items-end justify-center pb-1">
            <span className="font-serif italic text-base text-slate-950 font-black">Authorized Seal</span>
          </div>
          <p className="text-xs font-black text-slate-950">{branding.authorizedSignatoryTitle}</p>
          <p className="text-[10px] text-slate-950 font-bold">{branding.schoolName}</p>
        </div>
      </div>

      {/* System Footer Note */}
      <div className="flex justify-between items-center text-[10px] text-slate-950 font-bold pt-2 border-t border-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
          <span>Verified ERP Document | {branding.website}</span>
        </div>
        <div>
          <span>Printed By: {generatedBy} | {generatedDate}</span>
        </div>
      </div>
    </div>
  );
}
