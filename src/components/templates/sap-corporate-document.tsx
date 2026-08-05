import React from 'react'
import { CheckCircle2, QrCode } from 'lucide-react'
import { useCompanySettings } from '@/lib/company-settings'

export interface SapPartyInfo {
  title?: string
  name: string
  address?: string | string[]
  taxId?: string
  nib?: string
  contact?: string
  locationCode?: string
  extraLines?: Array<{ label: string; value: string }>
}

export interface SapMetaItem {
  label: string
  value: React.ReactNode
}

export interface SapTableHeader {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface SapTotalItem {
  label: string
  value: React.ReactNode
  isGrandTotal?: boolean
  highlight?: boolean
}

export interface SapCorporateDocumentProps {
  documentTitle: string
  documentSubtitle?: string
  documentNumber: string
  pageNumber?: string
  barcodeNumber?: string
  issueDate?: string
  dueDate?: string
  status?: string

  issuerInfo?: {
    name?: string
    address?: string
    npwp?: string
    nib?: string
    phone?: string
    email?: string
  }

  partyA?: SapPartyInfo
  partyB?: SapPartyInfo
  partyC?: SapPartyInfo

  metadataGrid?: SapMetaItem[]
  sectionBannerTitle?: string
  specsGrid?: Array<{ label: string; value: React.ReactNode }>

  tableHeaders?: SapTableHeader[]
  tableRows?: Array<Record<string, React.ReactNode>>
  children?: React.ReactNode

  totals?: SapTotalItem[]
  amountInWords?: string

  specialInstructions?: string | React.ReactNode
  remarks?: string | React.ReactNode

  paymentDetails?: {
    bankName?: string
    accountNo?: string
    accountName?: string
    billingCode?: string
    qrisText?: string
  }

  signatures?: Array<{
    title: string
    name?: string
    role?: string
    date?: string
    showStamp?: boolean
  }>
}

/**
 * Reusable SAP Corporate Official Printable Document Template
 * Standardized across all ERP ONE enterprise modules for corporate identity consistency.
 */
export function SapCorporateDocument({
  documentTitle,
  documentSubtitle = 'GLOBAL FREIGHT & OPERATIONAL ENTERPRISE SYSTEMS',
  documentNumber,
  pageNumber = 'Page 1 of 1',
  barcodeNumber,
  issueDate,
  dueDate,
  status,

  issuerInfo,

  partyA,
  partyB,
  partyC,

  metadataGrid,
  sectionBannerTitle,
  specsGrid,

  tableHeaders,
  tableRows,
  children,

  totals,
  amountInWords,

  specialInstructions,
  remarks,

  paymentDetails,

  signatures = [
    { title: 'Prepared By (Operations)', name: 'Operational Staff', role: 'Freight Coordinator', date: issueDate },
    { title: 'Approved By (Authorized Signatory)', name: 'Budi Santoso', role: 'General Manager', showStamp: true, date: issueDate },
    { title: 'Received By (Carrier / Client)', name: '....................................', role: 'Authorized Representative' },
  ],
}: SapCorporateDocumentProps) {
  const companySettings = useCompanySettings()

  const activeIssuer = {
    name: issuerInfo?.name || companySettings.name || 'PT REXINDO ARUNA SEDAYA',
    address: issuerInfo?.address || companySettings.address || 'Main Office St., Jakarta, Indonesia',
    npwp: issuerInfo?.npwp || companySettings.npwp || '01.234.567.8-901.000',
    nib: issuerInfo?.nib || companySettings.nib || '-',
    phone: issuerInfo?.phone || companySettings.phone || '+62-21-5555-0184',
    email: issuerInfo?.email || companySettings.email || 'info@rexindo.com',
  }

  const activePayment = paymentDetails ? {
    bankName: paymentDetails.bankName || companySettings.bankName,
    accountNo: paymentDetails.accountNo || companySettings.bankAccount,
    accountName: paymentDetails.accountName || companySettings.bankAccountName,
    billingCode: paymentDetails.billingCode,
    qrisText: paymentDetails.qrisText,
  } : (companySettings.bankName && companySettings.bankAccount ? {
    bankName: companySettings.bankName,
    accountNo: companySettings.bankAccount,
    accountName: companySettings.bankAccountName,
  } : undefined)

  const codeForBarcode = barcodeNumber || documentNumber

  // Format barcode bars visual representation
  const renderBarcodeVisual = () => (
    <div className="flex flex-col items-center justify-center space-y-0.5 my-1 select-none">
      <div className="flex items-center space-x-[1.5px] h-7 overflow-hidden">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className={`h-full bg-black ${
              i % 7 === 0 ? 'w-[3px]' : i % 3 === 0 ? 'w-[2px]' : 'w-[1px]'
            }`}
          />
        ))}
      </div>
      <div className="text-[9px] font-bold tracking-widest text-black uppercase">
        * {codeForBarcode} *
      </div>
    </div>
  )

  return (
    <article
      data-print-paper
      className="relative bg-white text-black font-sans select-text border border-black shadow-lg box-border print:shadow-none mx-auto text-[11px] leading-tight"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '8mm',
        boxSizing: 'border-box',
        color: '#000000',
      }}
    >
      {/* Scope Style Block to handle SAP grid & print overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sap-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .sap-table td, .sap-table th { border: 1px solid #000000; padding: 4px 6px; vertical-align: top; color: #000000; }
        .sap-th-dark { background-color: #000000 !important; color: #ffffff !important; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        .sap-box-header { background-color: #000000 !important; color: #ffffff !important; font-weight: bold; text-transform: uppercase; font-size: 10px; padding: 3px 6px; letter-spacing: 0.5px; border: 1px solid #000000; }
        .sap-cell-label { font-weight: bold; font-size: 10px; color: #333333; text-transform: uppercase; }
        .sap-cell-value { font-size: 11px; font-weight: 500; }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          header, nav, aside, button, [data-slot="sheet"], #root > div > div:first-child, .__react-router-devtools, .no-print {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          .print-paper-wrapper-parent {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
            width: auto !important;
            height: auto !important;
            opacity: 1 !important;
          }
          .print-paper-wrapper {
            transform: none !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          [data-print-paper] {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            border: 1px solid #000 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 8mm !important;
            z-index: 99999 !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
          }
        }
      `}} />

      <div className="flex flex-col justify-between min-h-full space-y-3">
        {/* TOP SAP HEADER */}
        <div className="space-y-2">
          {/* Main Title & Barcode Header Table */}
          <table className="sap-table">
            <tbody>
              <tr>
                <td style={{ width: '50%' }} className="p-2 border-r border-black">
                  <div className="flex items-center gap-2 mb-1">
                    {companySettings.logoUrl ? (
                      <img
                        src={companySettings.logoUrl}
                        alt="Company Logo"
                        className="h-8 w-auto max-w-[120px] object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-black text-white font-bold flex items-center justify-center text-xs tracking-tighter">
                        ERP
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-base tracking-tight leading-none text-black">
                        {activeIssuer.name}
                      </div>
                      <div className="text-[9px] text-gray-700 font-medium">
                        {documentSubtitle}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-0.5 border-t border-gray-300 pt-1 text-gray-800">
                    <div>{activeIssuer.address}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9.5px]">
                      <span><strong>NPWP:</strong> {activeIssuer.npwp}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9.5px]">
                      <span><strong>Tel:</strong> {activeIssuer.phone}</span>
                      <span><strong>Email:</strong> {activeIssuer.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ width: '50%' }} className="p-2 text-center bg-gray-50/50">
                  <div className="flex items-center justify-end border-b border-black pb-1 mb-1">
                    <span className="text-[9.5px] font-bold text-black">
                      {pageNumber}
                    </span>
                  </div>

                  <div className="bg-black text-white font-bold text-sm tracking-wider uppercase py-1 px-2 border border-black mb-1">
                    {documentTitle}
                  </div>

                  {renderBarcodeVisual()}

                  <div className="grid grid-cols-2 gap-1 text-[10px] border-t border-gray-300 pt-1 text-left">
                    <div>
                      <span className="text-gray-600 block text-[9px] uppercase font-bold">Doc Number</span>
                      <span className="font-bold">{documentNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-[9px] uppercase font-bold">Issue Date</span>
                      <span className="font-semibold">{issueDate || '-'}</span>
                    </div>
                    {dueDate && (
                      <div>
                        <span className="text-gray-600 block text-[9px] uppercase font-bold">Due / Valid Date</span>
                        <span className="font-semibold">{dueDate}</span>
                      </div>
                    )}
                    {status && (
                      <div>
                        <span className="text-gray-600 block text-[9px] uppercase font-bold">Status</span>
                        <span className="font-bold text-black uppercase">{status}</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* PARTIES GRID (SHIP FROM / SHIP TO / METADATA) */}
          {(partyA || partyB || partyC || metadataGrid) && (
            <table className="sap-table">
              <tbody>
                <tr>
                  {partyA && (
                    <td style={{ width: partyB ? (partyC ? '33.33%' : '50%') : '100%' }} className="p-0">
                      <div className="sap-box-header">{partyA.title || 'SHIP FROM / ISSUER / VENDOR'}</div>
                      <div className="p-2 space-y-1">
                        <div className="font-bold text-xs text-black">{partyA.name}</div>
                        {partyA.address && (
                          <div className="text-[10.5px] text-gray-800 leading-snug">
                            {Array.isArray(partyA.address) ? partyA.address.join(', ') : partyA.address}
                          </div>
                        )}
                        {partyA.taxId && <div className="text-[10px]">NPWP: {partyA.taxId}</div>}
                        {partyA.nib && <div className="text-[10px]">NIB: {partyA.nib}</div>}
                        {partyA.contact && <div className="text-[10px] text-gray-700">Contact: {partyA.contact}</div>}
                        {partyA.locationCode && <div className="text-[10px]">SID / Loc #: {partyA.locationCode}</div>}
                        {partyA.extraLines?.map((el, i) => (
                          <div key={i} className="text-[10px]">
                            <span className="font-bold">{el.label}:</span> {el.value}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  {partyB && (
                    <td style={{ width: partyC ? '33.33%' : '50%' }} className="p-0">
                      <div className="sap-box-header">{partyB.title || 'SHIP TO / CONSIGNEE / CLIENT'}</div>
                      <div className="p-2 space-y-1">
                        <div className="font-bold text-xs text-black">{partyB.name}</div>
                        {partyB.address && (
                          <div className="text-[10.5px] text-gray-800 leading-snug">
                            {Array.isArray(partyB.address) ? partyB.address.join(', ') : partyB.address}
                          </div>
                        )}
                        {partyB.taxId && <div className="text-[10px]">NPWP: {partyB.taxId}</div>}
                        {partyB.contact && <div className="text-[10px] text-gray-700">Contact: {partyB.contact}</div>}
                        {partyB.locationCode && <div className="text-[10px]">CID / Loc #: {partyB.locationCode}</div>}
                        {partyB.extraLines?.map((el, i) => (
                          <div key={i} className="text-[10px]">
                            <span className="font-bold">{el.label}:</span> {el.value}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  {partyC && (
                    <td style={{ width: '33.34%' }} className="p-0">
                      <div className="sap-box-header">{partyC.title || '3RD PARTY / FREIGHT CHARGES'}</div>
                      <div className="p-2 space-y-1">
                        <div className="font-bold text-xs text-black">{partyC.name}</div>
                        {partyC.address && (
                          <div className="text-[10.5px] text-gray-800 leading-snug">
                            {Array.isArray(partyC.address) ? partyC.address.join(', ') : partyC.address}
                          </div>
                        )}
                        {partyC.extraLines?.map((el, i) => (
                          <div key={i} className="text-[10px]">
                            <span className="font-bold">{el.label}:</span> {el.value}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>

                {metadataGrid && metadataGrid.length > 0 && (
                  <tr>
                    <td colSpan={partyC ? 3 : partyB ? 2 : 1} className="p-2 bg-gray-50/80">
                      <div className="grid grid-cols-4 gap-2 text-[10px]">
                        {metadataGrid.map((meta, idx) => (
                          <div key={idx} className="border-r border-gray-300 last:border-0 pr-1">
                            <span className="sap-cell-label block">{meta.label}:</span>
                            <span className="sap-cell-value">{meta.value}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* OPTIONAL SECTION BANNER */}
          {sectionBannerTitle && (
            <div className="sap-box-header text-center">{sectionBannerTitle}</div>
          )}

          {/* SPECS GRID */}
          {specsGrid && specsGrid.length > 0 && (
            <table className="sap-table">
              <tbody>
                <tr className="bg-gray-50">
                  {specsGrid.map((spec, i) => (
                    <td key={i} className="p-1.5 text-center">
                      <span className="sap-cell-label block">{spec.label}</span>
                      <span className="font-bold text-[11px] text-black">{spec.value}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}

          {/* MAIN DATA TABLE */}
          {tableHeaders && tableHeaders.length > 0 && tableRows && (
            <table className="sap-table">
              <thead>
                <tr>
                  {tableHeaders.map((head) => (
                    <th
                      key={head.key}
                      style={{ width: head.width }}
                      className={`sap-th-dark ${
                        head.align === 'right' ? 'text-right' : head.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {head.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}>
                    {tableHeaders.map((head) => (
                      <td
                        key={head.key}
                        className={`${
                          head.align === 'right' ? 'text-right font-semibold' : head.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {row[head.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* CUSTOM BODY / CHILDREN */}
          {children}

          {/* AMOUNT IN WORDS & FINANCIAL TOTALS */}
          {(amountInWords || (totals && totals.length > 0)) && (
            <table className="sap-table">
              <tbody>
                <tr>
                  {amountInWords ? (
                    <td style={{ width: totals && totals.length > 0 ? '50%' : '100%' }} className="p-2 border border-black bg-gray-50/50">
                      <span className="font-bold text-[10px] uppercase text-gray-700 block mb-1">
                        Amount in Words (Terbilang):
                      </span>
                      <div className="font-semibold italic text-[11px] text-black border border-black p-1.5 bg-white uppercase">
                        # {amountInWords} #
                      </div>
                    </td>
                  ) : null}

                  {totals && totals.length > 0 && (
                    <td style={{ width: amountInWords ? '50%' : '100%' }} className="p-0">
                      <table className="sap-table">
                        <tbody>
                          {totals.map((tot, idx) => (
                            <tr
                              key={idx}
                              className={tot.isGrandTotal ? 'bg-black text-white font-bold' : 'bg-white'}
                            >
                              <td className={`p-1.5 font-bold ${tot.isGrandTotal ? 'text-white' : 'text-gray-800'}`}>
                                {tot.label}
                              </td>
                              <td className={`p-1.5 text-right font-bold ${tot.isGrandTotal ? 'text-white text-xs border-double border-b-2 border-white' : 'text-black'}`}>
                                {tot.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          )}

          {/* SPECIAL INSTRUCTIONS / REMARKS */}
          {(specialInstructions || remarks || activePayment) && (
            <table className="sap-table">
              <tbody>
                <tr>
                  {(specialInstructions || remarks) && (
                    <td style={{ width: activePayment ? '50%' : '100%' }} className="p-2 space-y-1">
                      {specialInstructions && (
                        <div>
                          <span className="sap-cell-label block">Special Instructions / Conditions:</span>
                          <div className="text-[10px] text-gray-800 leading-snug">
                            {specialInstructions}
                          </div>
                        </div>
                      )}
                      {remarks && (
                        <div className="border-t border-gray-300 pt-1">
                          <span className="sap-cell-label block">Operational Remarks:</span>
                          <div className="text-[10px] text-gray-800 leading-snug">
                            {remarks}
                          </div>
                        </div>
                      )}
                    </td>
                  )}

                  {activePayment && (
                    <td style={{ width: (specialInstructions || remarks) ? '50%' : '100%' }} className="p-2 bg-gray-50/70">
                      <span className="sap-cell-label block mb-1">Official Payment Account:</span>
                      <div className="text-[10px] space-y-0.5 text-gray-900">
                        {activePayment.bankName && <div>Bank: <strong>{activePayment.bankName}</strong></div>}
                        {activePayment.accountNo && <div>Acc No: <strong>{activePayment.accountNo}</strong></div>}
                        {activePayment.accountName && <div>A/N: <strong>{activePayment.accountName}</strong></div>}
                        {activePayment.billingCode && (
                          <div className="mt-1 pt-1 border-t border-gray-300 text-black font-bold">
                            SIMPONI Billing: {activePayment.billingCode}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* BOTTOM SIGNATURES BLOCK */}
        <div className="space-y-2 pt-2 border-t border-black">
          {signatures && signatures.length > 0 && (
            <table className="sap-table">
              <tbody>
                <tr>
                  {signatures.map((sig, idx) => (
                    <td key={idx} style={{ width: `${100 / signatures.length}%` }} className="p-2 text-center border border-black">
                      <div className="font-bold text-[10px] uppercase text-gray-800 mb-1">
                        {sig.title}
                      </div>

                      <div className="h-16 flex items-center justify-center my-1 relative">
                        {sig.showStamp ? (
                          companySettings.stampUrl ? (
                            <img
                              src={companySettings.stampUrl}
                              alt="Official Stamp"
                              className="w-28 h-14 object-contain opacity-90"
                            />
                          ) : (
                            <div className="w-28 h-12 border-2 border-dashed border-red-700 rounded text-red-700 flex flex-col items-center justify-center opacity-80 text-[8.5px] font-bold uppercase tracking-tighter bg-red-50/30">
                              <span>{activeIssuer.name}</span>
                              <span>OFFICIAL SEAL</span>
                              <span>★ VERIFIED ★</span>
                            </div>
                          )
                        ) : (
                          <div className="w-32 border-b border-gray-400 mt-10" />
                        )}
                      </div>

                      <div className="font-bold text-[11px] text-black">{sig.name || 'Authorized Signatory'}</div>
                      <div className="text-[9.5px] text-gray-600">{sig.role || 'Operational Management'}</div>
                      {sig.date && <div className="text-[9px] text-gray-500 mt-0.5">Date: {sig.date}</div>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}

          {/* SAP SYSTEM LEGAL FOOTER */}
          <div className="text-center text-[9px] text-gray-600 space-y-0.5 pt-1">
            <p>
              ★ Official Computer-Generated SAP Enterprise Document • Issued under ERP ONE Systems • Valid without wet signature ★
            </p>
            <p className="text-[8.5px] text-gray-500">
              {activeIssuer.name} • {activeIssuer.address} • Tel: {activeIssuer.phone}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

