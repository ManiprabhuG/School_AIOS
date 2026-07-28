'use client';

import React from 'react';
import { PrintableHeader, PrintableFooter, TemplateBranding, defaultBranding } from './TemplateHeaderFooter';

export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (val: any, row: any) => React.ReactNode;
}

export interface ReportSummaryItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  moduleName: string;
  docNumber: string;
  generatedDate?: string;
  generatedBy?: string;
  columns: ReportColumn[];
  rows: any[];
  summaryItems?: ReportSummaryItem[];
}

interface ReportTemplateProps {
  data: ReportData;
  branding?: TemplateBranding;
  orientation?: 'portrait' | 'landscape';
}

export default function ReportTemplate({
  data,
  branding = defaultBranding,
  orientation = 'portrait',
}: ReportTemplateProps) {
  return (
    <div
      className={`bg-white text-slate-950 font-sans mx-auto p-8 border-2 border-slate-950 rounded-xl flex flex-col justify-between ${
        orientation === 'landscape' ? 'w-[1100px] max-w-full min-h-[700px]' : 'max-w-4xl w-full min-h-[842px]'
      }`}
    >
      <div>
      {/* Printable Header */}
      <PrintableHeader
        branding={branding}
        documentTitle={data.title}
        docNumber={data.docNumber}
        generatedDate={data.generatedDate}
        generatedBy={data.generatedBy}
      />

      {data.subtitle && (
        <div className="mb-4 text-xs font-black text-slate-950 bg-slate-100 p-3 rounded-lg border-2 border-slate-950">
          <span>{data.subtitle}</span>
        </div>
      )}

      {/* Summary KPI Cards if present */}
      {data.summaryItems && data.summaryItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {data.summaryItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-left ${
                item.highlight
                  ? 'bg-slate-950 text-white border-2 border-slate-950 shadow-sm'
                  : 'bg-white border-2 border-slate-950 text-slate-950 font-bold'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
                {item.label}
              </span>
              <span className="text-base font-black">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Report Data Table */}
      <div className="overflow-x-auto my-4">
        <table className="w-full text-left border-collapse border-2 border-slate-950 text-xs">
          <thead>
            <tr className="bg-slate-950 text-white font-black uppercase text-[11px] tracking-wide">
              <th className="py-2.5 px-3 border border-slate-800 text-center w-12 text-white">#</th>
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 border border-slate-800 text-white ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length + 1} className="py-6 text-center text-slate-700 italic font-bold">
                  No records match the requested report query.
                </td>
              </tr>
            ) : (
              data.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-100/60'}>
                  <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-950">
                    {idx + 1}
                  </td>
                  {data.columns.map((col) => {
                    const rawVal = row[col.key];
                    const rendered = col.render ? col.render(rawVal, row) : rawVal;
                    return (
                      <td
                        key={col.key}
                        className={`py-2 px-3 border border-slate-300 font-bold text-slate-950 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {rendered !== undefined && rendered !== null ? rendered : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Printable Footer */}
      <PrintableFooter
        branding={branding}
        generatedBy={data.generatedBy}
        generatedDate={data.generatedDate}
      />
    </div>
  );
}
