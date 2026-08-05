import { companySchema } from './company.schema'
import { shipmentSchema } from './shipment.schema'
import { clientContractSchema } from './client-contract.schema'
import { serviceQuotationSchema } from './service-quotation.schema'
import { vendorBillSchema } from './vendor-bill.schema'
import { clientInvoiceSchema } from './client-invoice.schema'
import { shippingInstructionSchema } from './shipping-instruction.schema'
import { accountsReceivableSchema } from './accounts-receivable.schema'
import { costAccrualSchema } from './cost-accrual.schema'
import { generalLedgerSchema } from './general-ledger.schema'
import { userAccountSchema } from './user-account.schema'
import { roleSchema } from './role.schema'
import { moduleControlSchema } from './module-control.schema'
import { auditLogSchema } from './audit-log.schema'
import type { ResourceSchema } from '@/lib/resource-schema'

export const resourceRegistry: Record<string, ResourceSchema> = {
  company: companySchema,
  shipment: shipmentSchema,
  clientContract: clientContractSchema,
  serviceQuotation: serviceQuotationSchema,
  vendorBill: vendorBillSchema,
  clientInvoice: clientInvoiceSchema,
  shippingInstruction: shippingInstructionSchema,
  accountsReceivable: accountsReceivableSchema,
  costAccrual: costAccrualSchema,
  generalLedger: generalLedgerSchema,
  userAccount: userAccountSchema,
  role: roleSchema,
  moduleControl: moduleControlSchema,
  auditLog: auditLogSchema,
}

export function getResourceSchema(resourceName: string): ResourceSchema | undefined {
  return resourceRegistry[resourceName]
}

export function getAllResourceSchemas(): ResourceSchema[] {
  return Object.values(resourceRegistry)
}

export {
  companySchema,
  shipmentSchema,
  clientContractSchema,
  serviceQuotationSchema,
  vendorBillSchema,
  clientInvoiceSchema,
  shippingInstructionSchema,
  accountsReceivableSchema,
  costAccrualSchema,
  generalLedgerSchema,
  userAccountSchema,
  roleSchema,
  moduleControlSchema,
  auditLogSchema,
}
