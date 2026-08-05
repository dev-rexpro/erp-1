import { clientCompanies } from './master-data'
import { users } from '@/features/users/data/users'
import { contracts } from '@/features/client-contracts/data/contracts'
import { quotations } from '@/features/service-quotations/data/quotations'
import { shippingInstructions } from '@/features/shipping-instructions/data/shipping-instructions'
import { packingLists } from '@/features/packing-lists/data/packing-lists'
import { shipments } from '@/features/shipments/data/shipments'
import { purchaseOrders, vendorRates, partnerDirectory } from '@/features/procurement/data/procurement-data'
import { mockAccountsReceivable, mockCostAccruals, mockVendorBills, mockGeneralLedger, mockChartOfAccounts } from '@/features/finance/data/finance-data'
import { invoices } from '@/features/client-invoices/data/invoices'
import { mockDndFees } from '@/features/dnd-fee/data/dnd-fees'
import { mockDocuments } from '@/features/document-hub/data/documents'

export function generateFullDemoData() {
  // We simply aggregate the meticulously crafted, interconnected data chains 
  // from the existing mock files to serve as our demo data seed.
  return {
    users,
    clients: clientCompanies,
    vendors: partnerDirectory,
    vendorRates,
    quotations,
    contracts,
    shippingInstructions,
    packingLists,
    shipments,
    purchaseOrders,
    vendorBills: mockVendorBills,
    clientInvoices: invoices,
    accountsReceivable: mockAccountsReceivable,
    costAccruals: mockCostAccruals,
    dndFees: mockDndFees,
    generalLedger: mockGeneralLedger,
    chartOfAccounts: mockChartOfAccounts,
    tasks: [],
    documents: mockDocuments,
  }
}
