import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportToCSV } from './utils';

export { exportToCSV };

export function exportToExcel<T extends Record<string, any>>(
  filename: string,
  data: T[],
  sheetName: string = 'Sheet1'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToPDF(
  filename: string,
  title: string,
  columns: { header: string; dataKey: string }[],
  data: Record<string, any>[]
) {
  const doc = new jsPDF('p', 'pt');

  // Title header in Pure Black & Dark Charcoal
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Pure Black #0f172a
  doc.text(title, 40, 40);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // Dark Slate #334155
  doc.text(`Generated on ${new Date().toLocaleString()} | ABS School ERP Official Document`, 40, 56);

  const formattedRows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.dataKey];
      return val === undefined || val === null ? '' : String(val);
    })
  );

  autoTable(doc, {
    startY: 70,
    head: [columns.map((c) => c.header)],
    body: formattedRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 6,
      textColor: [0, 0, 0], // Pure black text
      lineColor: [15, 23, 42], // Crisp Black borders
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Deep Black #0f172a header background
      textColor: [255, 255, 255], // Pure White header text
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Crisp neutral light row background
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function printData(title: string, columns: { header: string; dataKey: string }[], data: Record<string, any>[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headersHtml = columns.map((c) => `<th style="padding:10px; border:1.5px solid #000000; background:#0f172a; color:#ffffff; font-weight:800; text-align:left; text-transform:uppercase;">${c.header}</th>`).join('');
  const rowsHtml = data
    .map(
      (row, idx) =>
        `<tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">${columns
          .map((c) => `<td style="padding:8px; border:1px solid #000000; color:#000000; font-weight:600;">${row[c.dataKey] ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #000000; background: #ffffff; }
          h2 { font-size: 22px; color: #000000; margin-bottom: 4px; font-weight: 900; }
          p { font-size: 11px; color: #000000; margin-bottom: 20px; font-weight: 700; border-bottom: 2px solid #000000; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; border: 2px solid #000000; }
          @media print {
            body { padding: 0; background: #ffffff !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p>ABS School ERP Official Printout — ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export async function parseImportFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return resolve([]);
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) return resolve([]);

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const result = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, any> = {};
          headers.forEach((h, i) => {
            row[h] = values[i] ?? '';
          });
          return row;
        });
        resolve(result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        resolve(json);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    }
  });
}
