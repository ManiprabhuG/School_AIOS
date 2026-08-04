import { FeeStructure, ClassName } from '@/types';

export const DEFAULT_FEE_STRUCTURE_MATRIX: Record<ClassName, Partial<FeeStructure>> = {
  LKG: { className: 'LKG', tuitionFee: 25000, admissionFee: 5000, transportFee: 3000, uniformFee: 2000, labFee: 0, totalAnnualFee: 35000, dueDate: '2026-08-31' },
  UKG: { className: 'UKG', tuitionFee: 25000, admissionFee: 5000, transportFee: 3000, uniformFee: 2000, labFee: 0, totalAnnualFee: 35000, dueDate: '2026-08-31' },
  '1st': { className: '1st', tuitionFee: 28000, admissionFee: 5000, transportFee: 4000, uniformFee: 3000, labFee: 0, totalAnnualFee: 40000, dueDate: '2026-08-31' },
  '2nd': { className: '2nd', tuitionFee: 30000, admissionFee: 5000, transportFee: 4000, uniformFee: 3000, labFee: 0, totalAnnualFee: 42000, dueDate: '2026-08-31' },
  '3rd': { className: '3rd', tuitionFee: 32000, admissionFee: 5000, transportFee: 4000, uniformFee: 4000, labFee: 0, totalAnnualFee: 45000, dueDate: '2026-08-31' },
  '4th': { className: '4th', tuitionFee: 32000, admissionFee: 5000, transportFee: 4000, uniformFee: 4000, labFee: 0, totalAnnualFee: 45000, dueDate: '2026-08-31' },
  '5th': { className: '5th', tuitionFee: 35000, admissionFee: 5000, transportFee: 4000, uniformFee: 4000, labFee: 0, totalAnnualFee: 48000, dueDate: '2026-08-31' },
  '6th': { className: '6th', tuitionFee: 38000, admissionFee: 5000, transportFee: 4000, uniformFee: 4000, labFee: 1000, totalAnnualFee: 52000, dueDate: '2026-08-31' },
  '7th': { className: '7th', tuitionFee: 40000, admissionFee: 5000, transportFee: 5000, uniformFee: 4000, labFee: 1000, totalAnnualFee: 55000, dueDate: '2026-08-31' },
  '8th': { className: '8th', tuitionFee: 42000, admissionFee: 5000, transportFee: 5000, uniformFee: 4000, labFee: 2000, totalAnnualFee: 58000, dueDate: '2026-08-31' },
  '9th': { className: '9th', tuitionFee: 45000, admissionFee: 5000, transportFee: 5000, uniformFee: 5000, labFee: 2000, totalAnnualFee: 62000, dueDate: '2026-08-31' },
  '10th': { className: '10th', tuitionFee: 48000, admissionFee: 5000, transportFee: 5000, uniformFee: 5000, labFee: 2000, totalAnnualFee: 65000, dueDate: '2026-08-31' },
  '11th': { className: '11th', tuitionFee: 55000, admissionFee: 6000, transportFee: 6000, uniformFee: 5000, labFee: 3000, totalAnnualFee: 75000, dueDate: '2026-08-31' },
  '12th': { className: '12th', tuitionFee: 60000, admissionFee: 6000, transportFee: 6000, uniformFee: 5000, labFee: 3000, totalAnnualFee: 80000, dueDate: '2026-08-31' },
};

export function getFeeStructureForClass(className: string, configuredFeeStructures: FeeStructure[] = []): Partial<FeeStructure> {
  if (!className) return DEFAULT_FEE_STRUCTURE_MATRIX['10th'];
  const custom = configuredFeeStructures.find((fs) => fs.className === className);
  if (custom && custom.totalAnnualFee !== undefined && custom.totalAnnualFee !== null) {
    return custom;
  }
  const defaultEntry = DEFAULT_FEE_STRUCTURE_MATRIX[className as ClassName];
  if (defaultEntry) {
    return defaultEntry;
  }
  return {
    className: className as ClassName,
    tuitionFee: 45000,
    admissionFee: 5000,
    transportFee: 5000,
    uniformFee: 3000,
    labFee: 2000,
    totalAnnualFee: 60000,
    dueDate: '2026-08-31',
  };
}
