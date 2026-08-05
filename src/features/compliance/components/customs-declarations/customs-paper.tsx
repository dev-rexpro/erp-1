import { CustomsDeclarationItem } from '../../data/customs-data'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'

interface CustomsPaperProps {
  item: CustomsDeclarationItem
}

export function CustomsPaper({ item }: CustomsPaperProps) {
  const isImport = item.docType === 'PIB'

  const tableHeaders = [
    { key: 'hsCode', label: 'Pos HS Code / Tariff', width: '20%' },
    { key: 'description', label: 'Uraian Barang (Commodity Description)', width: '40%' },
    { key: 'weight', label: 'Berat Gross / Net', width: '20%', align: 'right' as const },
    { key: 'value', label: 'Nilai CIF (USD)', width: '20%', align: 'right' as const },
  ]

  const tableRows = [
    {
      hsCode: item.hsCode,
      description: item.goodsDescription,
      weight: `${item.grossWeightKg.toLocaleString()} kg / ${item.netWeightKg.toLocaleString()} kg`,
      value: `$${item.valueUSD.toLocaleString()}`,
    },
  ]

  const totals = [
    { label: `Nilai Pabean CIF IDR (Kurs Rp ${item.exchangeRate.toLocaleString()})`, value: `Rp ${item.cifIDR.toLocaleString('id-ID')}` },
    { label: `Bea Masuk BM (${item.dutyBmRate}%)`, value: `Rp ${item.dutyBmIDR.toLocaleString('id-ID')}` },
    { label: `PPN Impor (${item.vatRate}%)`, value: `Rp ${item.vatIDR.toLocaleString('id-ID')}` },
    { label: `PPh Art 22 (${item.pphRate}%)`, value: `Rp ${item.pphIDR.toLocaleString('id-ID')}` },
    { label: 'TOTAL PUNGUTAN BEA CUKAI & PAJAK', value: `Rp ${item.totalDutyIDR.toLocaleString('id-ID')}`, isGrandTotal: true },
  ]

  return (
    <SapCorporateDocument
      documentTitle={`PEMBERITAHUAN PABEAN (${item.bcType})`}
      documentNumber={item.docNo || item.ajuNumber}
      issueDate={item.submissionDate}
      status={item.status || 'RELEASED (SPPB)'}
      partyA={{
        title: isImport ? 'IMPORTIR / PEMILIK BARANG' : 'EKSPORTIR',
        name: item.partyName,
        address: item.customsOffice,
        taxId: item.npwp,
        extraLines: [{ label: 'NIB', value: item.nib }],
      }}
      partyB={{
        title: isImport ? 'PEMBEKAL / SUPPLIER (ORIGIN)' : 'PEMBELI / BUYER (DESTINATION)',
        name: item.counterParty,
        address: `${item.country} • ${item.portName}`,
      }}
      metadataGrid={[
        { label: 'Nomor Aju (26 Digit)', value: item.ajuNumber },
        { label: 'Jalur Kepabeanan', value: `JALUR ${item.channel.toUpperCase()}` },
        { label: 'Sarana Pengangkut', value: item.vesselName },
        { label: 'No. B/L / Container', value: `${item.blNumber} / ${item.containerNo}` },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      totals={totals}
      specialInstructions={`Kode Billing SIMPONI: ${item.billingCode} (${item.billingStatus}) | SPPB No: ${item.sppbNumber} (${item.sppbDate})`}
      remarks={`Direktorat Jenderal Bea dan Cukai (DJBC) - ${item.customsOffice}. Verified digitally via CEISA 4.0.`}
      signatures={[
        { title: 'Pejabat Pemeriksa Bea Cukai', name: 'Sistem CEISA 4.0', role: 'Customs Inspector', showStamp: true, date: item.sppbDate },
        { title: 'Importir / PPJK Authorized', name: item.partyName, role: 'Deklaran Resmi', date: item.submissionDate },
      ]}
    />
  )
}

