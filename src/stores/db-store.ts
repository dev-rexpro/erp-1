import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateFullDemoData } from '@/lib/mock-data/data-generator'

export interface DbState {
  users: any[]
  clients: any[]
  vendors: any[]
  vendorRates: any[]
  quotations: any[]
  contracts: any[]
  shippingInstructions: any[]
  packingLists: any[]
  shipments: any[]
  purchaseOrders: any[]
  vendorBills: any[]
  clientInvoices: any[]
  accountsReceivable: any[]
  costAccruals: any[]
  dndFees: any[]
  generalLedger: any[]
  tasks: any[]
  documents: any[]

  // Methods
  importData: (data: Partial<DbState>) => void
  exportData: () => string
  generateDemoData: () => void
  deleteAllData: () => void

  // Setters for standard CRUD
  setUsers: (users: any[]) => void
  setClients: (clients: any[]) => void
  setVendors: (vendors: any[]) => void
  setVendorRates: (rates: any[]) => void
  setQuotations: (quotations: any[]) => void
  setContracts: (contracts: any[]) => void
  setShippingInstructions: (si: any[]) => void
  setPackingLists: (pl: any[]) => void
  setShipments: (shipments: any[]) => void
  setPurchaseOrders: (pos: any[]) => void
  setVendorBills: (bills: any[]) => void
  setClientInvoices: (invoices: any[]) => void
  setAccountsReceivable: (ar: any[]) => void
  setCostAccruals: (accruals: any[]) => void
  setDndFees: (fees: any[]) => void
  setGeneralLedger: (gl: any[]) => void
  setTasks: (tasks: any[]) => void
  setDocuments: (documents: any[]) => void
}

const emptyState = {
  users: [],
  clients: [],
  vendors: [],
  vendorRates: [],
  quotations: [],
  contracts: [],
  shippingInstructions: [],
  packingLists: [],
  shipments: [],
  purchaseOrders: [],
  vendorBills: [],
  clientInvoices: [],
  accountsReceivable: [],
  costAccruals: [],
  dndFees: [],
  generalLedger: [],
  tasks: [],
  documents: [],
}

export const useDbStore = create<DbState>()(
  persist(
    (set, get) => ({
      ...generateFullDemoData(),

      importData: (data) => set({ ...data }),
      
      exportData: () => {
        const state = get()
        const { importData, exportData, generateDemoData, deleteAllData, setUsers, setClients, setVendors, setVendorRates, setQuotations, setContracts, setShippingInstructions, setPackingLists, setShipments, setPurchaseOrders, setVendorBills, setClientInvoices, setAccountsReceivable, setCostAccruals, setDndFees, setGeneralLedger, setTasks, ...dataToExport } = state as any
        return JSON.stringify(dataToExport, null, 2)
      },

      deleteAllData: () => set({ ...emptyState }),

      generateDemoData: () => {
        const fullData = generateFullDemoData()
        set({ ...fullData })
      },

      setUsers: (users) => set({ users }),
      setClients: (clients) => set({ clients }),
      setVendors: (vendors) => set({ vendors }),
      setVendorRates: (vendorRates) => set({ vendorRates }),
      setQuotations: (quotations) => set({ quotations }),
      setContracts: (contracts) => set({ contracts }),
      setShippingInstructions: (shippingInstructions) => set({ shippingInstructions }),
      setPackingLists: (packingLists) => set({ packingLists }),
      setShipments: (shipments) => set({ shipments }),
      setPurchaseOrders: (purchaseOrders) => set({ purchaseOrders }),
      setVendorBills: (vendorBills) => set({ vendorBills }),
      setClientInvoices: (clientInvoices) => set({ clientInvoices }),
      setAccountsReceivable: (accountsReceivable) => set({ accountsReceivable }),
      setCostAccruals: (costAccruals) => set({ costAccruals }),
      setDndFees: (dndFees) => set({ dndFees }),
      setGeneralLedger: (generalLedger) => set({ generalLedger }),
      setTasks: (tasks) => set({ tasks }),
      setDocuments: (documents) => set({ documents }),
    }),
    {
      name: 'erp-db-store',
    }
  )
)
