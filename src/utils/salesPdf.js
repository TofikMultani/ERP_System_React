import { jsPDF } from 'jspdf';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function formatAmount(value) {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
}

function saveSalesDocument({ title, fileName, codeLabel, codeValue, fields }) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(11);
  doc.text(`${codeLabel}: ${codeValue || '-'}`, 14, 30);

  let y = 42;
  fields.forEach((field) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${field.label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(field.value ?? '-'), 70, y);
    y += 9;
  });

  doc.setFontSize(9);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 285);

  doc.save(fileName);
}

export function downloadInvoicePdf(invoice) {
  const code = invoice?.code || 'INVOICE';

  saveSalesDocument({
    title: 'Sales Invoice',
    fileName: `${code}.pdf`,
    codeLabel: 'Invoice Number',
    codeValue: code,
    fields: [
      { label: 'Customer Code', value: invoice?.customerCode || '-' },
      { label: 'Invoice Date', value: formatDate(invoice?.invoiceDate) },
      { label: 'Due Date', value: formatDate(invoice?.dueDate) },
      { label: 'Amount', value: formatAmount(invoice?.amount) },
      { label: 'Status', value: invoice?.status || '-' },
      { label: 'Payment Date', value: formatDate(invoice?.paymentDate) },
    ],
  });
}

export function downloadQuotationPdf(quotation) {
  const code = quotation?.code || 'QUOTATION';

  saveSalesDocument({
    title: 'Sales Quotation',
    fileName: `${code}.pdf`,
    codeLabel: 'Quotation Number',
    codeValue: code,
    fields: [
      { label: 'Customer Code', value: quotation?.customerCode || '-' },
      { label: 'Quotation Date', value: formatDate(quotation?.quotationDate) },
      { label: 'Expiry Date', value: formatDate(quotation?.expiryDate) },
      { label: 'Amount', value: formatAmount(quotation?.amount) },
      { label: 'Status', value: quotation?.status || '-' },
      { label: 'Conversion Status', value: quotation?.conversionStatus || '-' },
    ],
  });
}
