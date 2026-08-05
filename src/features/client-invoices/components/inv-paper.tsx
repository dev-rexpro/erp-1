import {
  getInvoiceDiscount,
  getInvoiceItems,
  getInvoiceSubtotal,
  getInvoiceTax,
  getInvoiceTaxOption,
  getInvoiceTotal,
  getLineAmount,
  terbilang,
  type InvoiceFormValues,
} from './invoice-form-data'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'

export function InvPaper({ invoice }: { invoice: InvoiceFormValues }) {
  const items = getInvoiceItems(invoice)
  const subtotal = getInvoiceSubtotal(invoice)
  const discount = getInvoiceDiscount(invoice)
  const tax = getInvoiceTax(invoice)
  const grandTotal = getInvoiceTotal(invoice)
  const taxOption = getInvoiceTaxOption(invoice)

  const formatRupiah = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID')
  }

  const tableHeaders = [
    { key: 'no', label: 'No', width: '6%', align: 'center' as const },
    { key: 'desc', label: 'Description & Scope of Service', width: '44%' },
    { key: 'qty', label: 'Qty', width: '8%', align: 'center' as const },
    { key: 'unit', label: 'Unit', width: '10%', align: 'center' as const },
    { key: 'price', label: 'Unit Rate (IDR)', width: '16%', align: 'right' as const },
    { key: 'total', label: 'Amount (IDR)', width: '16%', align: 'right' as const },
  ]

  const tableRows = items.map((item, idx) => ({
    no: idx + 1,
    desc: item.description || 'Logistics Service Line Item',
    qty: item.quantity,
    unit: 'PCS',
    price: formatRupiah(item.unitPrice),
    total: formatRupiah(getLineAmount(item)),
  }))

  const totals = [
    { label: 'Subtotal Amount', value: formatRupiah(subtotal) },
    ...(discount > 0 ? [{ label: 'Discount / Rebate', value: `- ${formatRupiah(discount)}` }] : []),
    { label: `VAT / PPN (${taxOption.rate}%)`, value: formatRupiah(tax) },
    { label: 'GRAND TOTAL INVOICE', value: formatRupiah(grandTotal), isGrandTotal: true },
  ]

  return (
    <SapCorporateDocument
      documentTitle="COMMERCIAL INVOICE"
      documentNumber={invoice.referenceNumber || 'INV-2026-0001'}
      issueDate={invoice.issuedDate || new Date().toISOString().split('T')[0]}
      dueDate={invoice.paymentDueDate || '-'}
      status="ISSUED"
      partyA={{
        title: 'ISSUER / BILLED FROM',
        name: invoice.from?.name || 'PT FREIGHT LOGISTICS INDONESIA',
        address: invoice.from?.addressLines?.join(', ') || 'Grand Slipi Tower 18th Fl, Jl. S. Parman, Jakarta',
        taxId: invoice.from?.taxId || '01.345.678.9-015.000',
        contact: invoice.from?.email || 'finance@freightlogistics.co.id',
      }}
      partyB={{
        title: 'CLIENT / BILLED TO',
        name: invoice.to?.name || 'PT GLOBAL CLIENT LOGISTICS',
        address: invoice.to?.addressLines?.join(', ') || 'Kaw. Industri MM2100, Cikarang, Jawa Barat',
        taxId: invoice.to?.taxId || '02.441.980.2-054.000',
        contact: invoice.to?.email || 'finance@client.co.id',
        extraLines: invoice.shipTo ? [{ label: 'Ship To', value: invoice.shipTo }] : undefined,
      }}
      metadataGrid={[
        { label: 'PO Number', value: invoice.poNumber || 'PO-2026-8819' },
        { label: 'Payment Terms', value: 'Net 30 Days' },
        { label: 'Currency', value: 'IDR (Rupiah)' },
        { label: 'Billing System', value: 'SAP ERP ONE' },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      amountInWords={terbilang(grandTotal)}
      specialInstructions={invoice.notes || '1. Payment due within specified payment term. 2. Please mention invoice number in transfer reference.'}
      paymentDetails={{
        bankName: invoice.bankName || 'Bank Mandiri (Cab. Jakarta Slipi)',
        accountNo: invoice.bankAccount || '118-00-1299840-2',
        accountName: invoice.bankAccountName || 'PT FREIGHT LOGISTICS INDONESIA',
      }}
      signatures={[
        { title: 'Billing Officer', name: 'Dewi Lestari', role: 'AR Accountant', date: invoice.issuedDate },
        { title: 'Authorized Signatory', name: 'Budi Santoso', role: 'Finance Director', showStamp: true, date: invoice.issuedDate },
        { title: 'Client Acceptance', name: '....................................', role: 'Finance Dept.' },
      ]}
    />
  )
}
