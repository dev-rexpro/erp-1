import { resourceStore, type ResourceRecord } from '@/lib/resource-store'
import { getResourceSchema } from '@/resources'

export interface FlowStepNode {
  resourceName: string
  label: string
  recordId?: string
  title?: string
  status?: string
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'
  isCurrent?: boolean
  canCreateNext?: boolean
}

export interface ChainFlowSummary {
  nodes: FlowStepNode[]
  currentResource: string
  currentRecordId: string
  relatedRecords: Record<string, ResourceRecord>
}

export const DOCUMENT_CHAIN_ORDER = [
  { resourceName: 'company', label: '1. Client Account', codePrefix: 'CMP' },
  { resourceName: 'serviceQuotation', label: '2. Quotation', codePrefix: 'QUO' },
  { resourceName: 'clientContract', label: '3. Contract SLA', codePrefix: 'CTR' },
  { resourceName: 'shippingInstruction', label: '4. Shipping Instruction', codePrefix: 'SI' },
  { resourceName: 'shipment', label: '5. Freight Shipment', codePrefix: 'SHP' },
  { resourceName: 'vendorBill', label: '6. Vendor Bill (HPP)', codePrefix: 'VBL' },
  { resourceName: 'clientInvoice', label: '7. Client Invoice', codePrefix: 'INV' },
  { resourceName: 'accountsReceivable', label: '8. AR / Payment', codePrefix: 'AR' },
]

/**
 * Find all connected document records across the document flow chain
 */
export function getDocumentFlowChain(resourceName: string, recordId: string): ChainFlowSummary {
  const currentRecord = resourceStore.getById(resourceName, recordId)
  const relatedRecords: Record<string, ResourceRecord> = {}

  if (!currentRecord) {
    return {
      nodes: DOCUMENT_CHAIN_ORDER.map((item) => ({
        resourceName: item.resourceName,
        label: item.label,
        isCurrent: item.resourceName === resourceName,
      })),
      currentResource: resourceName,
      currentRecordId: recordId,
      relatedRecords: {},
    }
  }

  // 1. Identify companyId
  const companyId = currentRecord.companyId || (resourceName === 'company' ? currentRecord.id : undefined)
  if (companyId) {
    const comp = resourceStore.getById('company', companyId)
    if (comp) relatedRecords.company = comp
  }

  // 2. Identify quotation
  let quotationId = currentRecord.quotationId || (resourceName === 'serviceQuotation' ? currentRecord.id : undefined)
  if (!quotationId && companyId) {
    const quo = resourceStore.getAll('serviceQuotation').find((q) => q.companyId === companyId || q.id === currentRecord.quotationId)
    if (quo) {
      quotationId = quo.id
      relatedRecords.serviceQuotation = quo
    }
  } else if (quotationId) {
    const quo = resourceStore.getById('serviceQuotation', quotationId)
    if (quo) relatedRecords.serviceQuotation = quo
  }

  // 3. Identify contract
  let contractId = currentRecord.contractId || (resourceName === 'clientContract' ? currentRecord.id : undefined)
  if (!contractId && companyId) {
    const ctr = resourceStore.getAll('clientContract').find((c) => c.companyId === companyId || c.quotationId === quotationId)
    if (ctr) {
      contractId = ctr.id
      relatedRecords.clientContract = ctr
    }
  } else if (contractId) {
    const ctr = resourceStore.getById('clientContract', contractId)
    if (ctr) relatedRecords.clientContract = ctr
  }

  // 4. Identify shippingInstruction
  let siId = currentRecord.siId || currentRecord.shippingInstructionId || (resourceName === 'shippingInstruction' ? currentRecord.id : undefined)
  if (!siId && (currentRecord.id || companyId)) {
    const si = resourceStore.getAll('shippingInstruction').find(
      (s) => s.id === currentRecord.siId || s.shipmentId === currentRecord.id || (companyId && s.companyId === companyId)
    )
    if (si) {
      siId = si.id
      relatedRecords.shippingInstruction = si
    }
  } else if (siId) {
    const si = resourceStore.getById('shippingInstruction', siId)
    if (si) relatedRecords.shippingInstruction = si
  }

  // 5. Identify shipment
  let shipmentId = currentRecord.shipmentId || (resourceName === 'shipment' ? currentRecord.id : undefined)
  if (!shipmentId && (siId || companyId)) {
    const shp = resourceStore.getAll('shipment').find((s) => s.id === currentRecord.shipmentId || s.siId === siId || (companyId && s.companyId === companyId))
    if (shp) {
      shipmentId = shp.id
      relatedRecords.shipment = shp
    }
  } else if (shipmentId) {
    const shp = resourceStore.getById('shipment', shipmentId)
    if (shp) relatedRecords.shipment = shp
  }

  // 6. Identify vendorBill
  if (shipmentId || resourceName === 'vendorBill') {
    const vbl = resourceStore.getAll('vendorBill').find((v) => (resourceName === 'vendorBill' && v.id === currentRecord.id) || v.shipmentId === shipmentId)
    if (vbl) relatedRecords.vendorBill = vbl
  }

  // 7. Identify clientInvoice
  let invoiceId = currentRecord.invoiceId || currentRecord.clientInvoiceId || (resourceName === 'clientInvoice' ? currentRecord.id : undefined)
  if (!invoiceId && shipmentId) {
    const inv = resourceStore.getAll('clientInvoice').find((i) => i.shipmentId === shipmentId || (companyId && i.companyId === companyId))
    if (inv) {
      invoiceId = inv.id
      relatedRecords.clientInvoice = inv
    }
  } else if (invoiceId) {
    const inv = resourceStore.getById('clientInvoice', invoiceId)
    if (inv) relatedRecords.clientInvoice = inv
  }

  // 8. Identify accountsReceivable
  if (invoiceId || resourceName === 'accountsReceivable') {
    const ar = resourceStore.getAll('accountsReceivable').find(
      (a) => (resourceName === 'accountsReceivable' && a.id === currentRecord.id) || a.clientInvoiceId === invoiceId || a.invoiceNumber === relatedRecords.clientInvoice?.invoiceNo
    )
    if (ar) relatedRecords.accountsReceivable = ar
  }

  // Build nodes
  const nodes: FlowStepNode[] = DOCUMENT_CHAIN_ORDER.map((item, index) => {
    const rec = relatedRecords[item.resourceName]
    const schema = getResourceSchema(item.resourceName)
    const title = rec && schema ? rec[schema.titleField] || rec.name || rec.id : undefined
    const status = rec ? rec.status : undefined

    let badgeVariant: FlowStepNode['badgeVariant'] = 'outline'
    if (status) {
      if (['Active', 'Confirmed', 'Delivered', 'Paid', 'Accepted'].includes(status)) {
        badgeVariant = 'success'
      } else if (['Cancelled', 'Rejected', 'Overdue'].includes(status)) {
        badgeVariant = 'destructive'
      } else if (['In Transit', 'Customs Clearance', 'Sent', 'Submitted', 'Partially Paid'].includes(status)) {
        badgeVariant = 'info'
      } else if (['Unpaid', 'Draft', 'Pending Revision'].includes(status)) {
        badgeVariant = 'warning'
      }
    }

    const prevItem = index > 0 ? DOCUMENT_CHAIN_ORDER[index - 1] : null
    const canCreateNext = !rec && Boolean(prevItem && relatedRecords[prevItem.resourceName])

    return {
      resourceName: item.resourceName,
      label: item.label,
      recordId: rec ? rec.id : undefined,
      title,
      status,
      badgeVariant,
      isCurrent: item.resourceName === resourceName,
      canCreateNext,
    }
  })

  return {
    nodes,
    currentResource: resourceName,
    currentRecordId: recordId,
    relatedRecords,
  }
}

/**
 * Cancel a document and cascade status updates across all downstream linked documents
 */
export function cancelDocumentChain(
  resourceName: string,
  recordId: string,
  reason: string,
  currentUser: string
): { updatedCount: number; affectedDocs: Array<{ resource: string; title: string; id: string }> } {
  const chain = getDocumentFlowChain(resourceName, recordId)
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
  const affectedDocs: Array<{ resource: string; title: string; id: string }> = []

  // Update current document
  const currentRec = resourceStore.getById(resourceName, recordId)
  if (currentRec) {
    const schema = getResourceSchema(resourceName)
    const title = currentRec[schema?.titleField || 'name'] || recordId
    resourceStore.save(resourceName, {
      ...currentRec,
      status: 'Cancelled',
      cancellationReason: reason,
      updatedBy: currentUser,
      updatedAt: timestamp,
    })
    affectedDocs.push({ resource: schema?.label || resourceName, title, id: recordId })
  }

  // Cascade to downstream records
  Object.entries(chain.relatedRecords).forEach(([rName, rec]) => {
    if (rName === resourceName) return // already updated
    const schema = getResourceSchema(rName)
    if (!schema) return

    let nextStatus = 'Cancelled'
    if (rName === 'serviceQuotation') nextStatus = 'Rejected'
    if (rName === 'shippingInstruction') nextStatus = 'Rejected'
    if (rName === 'accountsReceivable') nextStatus = 'Disputed'

    resourceStore.save(rName, {
      ...rec,
      status: nextStatus,
      cancellationReason: `Cascaded cancellation from parent ${resourceName} #${recordId}: ${reason}`,
      updatedBy: currentUser,
      updatedAt: timestamp,
    })

    affectedDocs.push({
      resource: schema.label,
      title: rec[schema.titleField] || rec.id,
      id: rec.id,
    })
  })

  // Append Audit Log entry
  resourceStore.save('auditLog', {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp,
    userName: currentUser,
    userRole: 'Authorized Operator',
    action: 'CANCEL_CHAIN',
    module: getResourceSchema(resourceName)?.label || resourceName,
    target: `${resourceName} #${recordId}`,
    details: `Cancelled document chain (${affectedDocs.length} records affected). Reason: "${reason}"`,
    ipAddress: '10.240.2.10',
  })

  return {
    updatedCount: affectedDocs.length,
    affectedDocs,
  }
}

/**
 * Revise a document and mark connected documents as Pending Revision
 */
export function reviseDocumentChain(
  resourceName: string,
  recordId: string,
  revisionNotes: string,
  currentUser: string
): { updatedCount: number; affectedDocs: Array<{ resource: string; title: string; id: string }> } {
  const chain = getDocumentFlowChain(resourceName, recordId)
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
  const affectedDocs: Array<{ resource: string; title: string; id: string }> = []

  const currentRec = resourceStore.getById(resourceName, recordId)
  if (currentRec) {
    const schema = getResourceSchema(resourceName)
    const title = currentRec[schema?.titleField || 'name'] || recordId
    const revCount = (currentRec.revisionCount || 0) + 1

    resourceStore.save(resourceName, {
      ...currentRec,
      status: 'Draft',
      revisionNotes,
      revisionCount: revCount,
      updatedBy: currentUser,
      updatedAt: timestamp,
    })
    affectedDocs.push({ resource: schema?.label || resourceName, title, id: recordId })
  }

  // Cascade revision note
  Object.entries(chain.relatedRecords).forEach(([rName, rec]) => {
    if (rName === resourceName) return
    const schema = getResourceSchema(rName)
    if (!schema) return

    resourceStore.save(rName, {
      ...rec,
      revisionNotes: `Linked document ${resourceName} #${recordId} was revised: ${revisionNotes}`,
      updatedBy: currentUser,
      updatedAt: timestamp,
    })

    affectedDocs.push({
      resource: schema.label,
      title: rec[schema.titleField] || rec.id,
      id: rec.id,
    })
  })

  // Audit log
  resourceStore.save('auditLog', {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp,
    userName: currentUser,
    userRole: 'Authorized Operator',
    action: 'REVISE_CHAIN',
    module: getResourceSchema(resourceName)?.label || resourceName,
    target: `${resourceName} #${recordId}`,
    details: `Revised document. Notes: "${revisionNotes}". Synchronized with ${affectedDocs.length} linked documents.`,
    ipAddress: '10.240.2.10',
  })

  return {
    updatedCount: affectedDocs.length,
    affectedDocs,
  }
}

/**
 * Automatically generate the next document in the flow chain pre-filled with source data
 */
export function generateNextDocument(
  sourceResourceName: string,
  sourceRecordId: string,
  targetResourceName: string,
  currentUser: string
): ResourceRecord | null {
  const sourceRec = resourceStore.getById(sourceResourceName, sourceRecordId)
  if (!sourceRec) return null

  const targetSchema = getResourceSchema(targetResourceName)
  if (!targetSchema) return null

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
  const randomSuffix = Math.floor(100 + Math.random() * 900)

  const newRecord: ResourceRecord = {
    id: `GEN-${Date.now().toString().slice(-6)}`,
    companyId: sourceRec.companyId || (sourceResourceName === 'company' ? sourceRec.id : undefined),
    quotationId: sourceRec.quotationId || (sourceResourceName === 'serviceQuotation' ? sourceRec.id : undefined),
    contractId: sourceRec.contractId || (sourceResourceName === 'clientContract' ? sourceRec.id : undefined),
    siId: sourceRec.siId || (sourceResourceName === 'shippingInstruction' ? sourceRec.id : undefined),
    shipmentId: sourceRec.shipmentId || (sourceResourceName === 'shipment' ? sourceRec.id : undefined),
    status: 'Draft',
    createdBy: currentUser,
    createdAt: timestamp,
    updatedBy: currentUser,
    updatedAt: timestamp,
  }

  // Custom mapping per target entity
  if (targetResourceName === 'serviceQuotation') {
    newRecord.quotationNo = `QUO-2026-${randomSuffix}`
    newRecord.origin = sourceRec.originPort || 'Tanjung Priok (IDTPP)'
    newRecord.destination = sourceRec.destinationPort || 'Singapore (SGSIN)'
    newRecord.totalAmountUsd = sourceRec.freightCharge || 4500
    newRecord.issuedDate = new Date().toISOString().split('T')[0]
    newRecord.validityDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  } else if (targetResourceName === 'clientContract') {
    newRecord.contractNo = `CTR-2026-${randomSuffix}`
    newRecord.contractType = 'Standard Freight Forwarding Agreement'
    newRecord.committedVolumeTeu = 500
    newRecord.paymentTerms = 'Net 30 Days'
    newRecord.validFrom = new Date().toISOString().split('T')[0]
    newRecord.validUntil = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  } else if (targetResourceName === 'shippingInstruction') {
    newRecord.siNo = `SI-2026-${randomSuffix}`
    newRecord.shipperName = sourceRec.companyName || 'PT Export Logistics Indonesia'
    newRecord.carrierName = 'Maersk Line / Ocean Line'
    newRecord.vesselVoyage = sourceRec.vesselFlight || 'MSC MAYA v.024E'
    newRecord.pol = sourceRec.originPort || 'Tanjung Priok (IDTPP)'
    newRecord.pod = sourceRec.destinationPort || 'Singapore (SGSIN)'
    newRecord.status = 'Submitted'
  } else if (targetResourceName === 'shipment') {
    newRecord.shipmentNo = `SHP-2026-${randomSuffix}`
    newRecord.transportMode = 'Ocean Freight (FCL)'
    newRecord.originPort = sourceRec.pol || sourceRec.origin || 'Tanjung Priok (IDTPP)'
    newRecord.destinationPort = sourceRec.pod || sourceRec.destination || 'Singapore (SGSIN)'
    newRecord.etd = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    newRecord.eta = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    newRecord.incoterm = 'FOB'
    newRecord.freightCharge = sourceRec.totalAmountUsd || 4200
  } else if (targetResourceName === 'vendorBill') {
    newRecord.billNo = `VBL-2026-${randomSuffix}`
    newRecord.totalAmountUsd = sourceRec.freightCharge ? Math.round(sourceRec.freightCharge * 0.75) : 3200
    newRecord.billDate = new Date().toISOString().split('T')[0]
    newRecord.dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    newRecord.notes = `Auto-generated vendor cost bill for ${sourceResourceName} #${sourceRecordId}`
  } else if (targetResourceName === 'clientInvoice') {
    newRecord.invoiceNo = `INV-2026-${randomSuffix}`
    newRecord.totalAmountUsd = sourceRec.freightCharge || sourceRec.totalAmountUsd || 5400
    newRecord.issueDate = new Date().toISOString().split('T')[0]
    newRecord.dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    newRecord.status = 'Sent'
  } else if (targetResourceName === 'accountsReceivable') {
    newRecord.invoiceNumber = sourceRec.invoiceNo || `INV-2026-${randomSuffix}`
    newRecord.amount = sourceRec.totalAmountUsd || 5400
    newRecord.paidAmount = 0
    newRecord.balanceDue = sourceRec.totalAmountUsd || 5400
    newRecord.agingCategory = 'Current'
    newRecord.status = 'Current'
    newRecord.dueDate = sourceRec.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  }

  const saved = resourceStore.save(targetResourceName, newRecord)

  // Audit log
  resourceStore.save('auditLog', {
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp,
    userName: currentUser,
    userRole: 'Authorized Operator',
    action: 'CREATE_LINKED',
    module: targetSchema.label,
    target: `${targetResourceName} #${saved.id}`,
    details: `Generated linked ${targetSchema.label} from source ${sourceResourceName} #${sourceRecordId}.`,
    ipAddress: '10.240.2.10',
  })

  return saved
}

export function getRouteForResource(resourceNameOrDocType: string): { routePath: string; storageKey: string } {
  const norm = resourceNameOrDocType.toLowerCase()

  if (norm.includes('company') || norm.includes('account') || norm.includes('partner') || norm.includes('client account')) {
    return { routePath: '/commercial/client-accounts', storageKey: 'openRecordId_company' }
  }
  if (norm.includes('quotation') || norm.includes('quote') || norm.includes('servicequotation')) {
    return { routePath: '/commercial/service-quotations', storageKey: 'openRecordId_serviceQuotation' }
  }
  if (norm.includes('contract') || norm.includes('clientcontract')) {
    return { routePath: '/commercial/client-contracts', storageKey: 'openRecordId_clientContract' }
  }
  if (norm.includes('shipping') || norm.includes('instruction') || norm.includes('si') || norm.includes('packing')) {
    return { routePath: '/logistics/shipping-instructions', storageKey: 'openRecordId_shippingInstruction' }
  }
  if (norm.includes('shipment') || norm.includes('freight') || norm.includes('lading') || norm.includes('bl') || norm.includes('goods issue') || norm.includes('terminal')) {
    return { routePath: '/logistics/shipments', storageKey: 'openRecordId_shipment' }
  }
  if (norm.includes('vendor') || norm.includes('vbl') || norm.includes('vendorbill')) {
    return { routePath: '/finance/vendor-bills', storageKey: 'openRecordId_vendorBill' }
  }
  if (norm.includes('invoice') || norm.includes('inv') || norm.includes('clientinvoice') || norm.includes('faktur') || norm.includes('commercial sales')) {
    return { routePath: '/finance/client-invoicing', storageKey: 'openRecordId_clientInvoice' }
  }
  if (norm.includes('ar') || norm.includes('receivable') || norm.includes('journal') || norm.includes('bank') || norm.includes('collection') || norm.includes('accountsreceivable')) {
    return { routePath: '/finance/accounts-receivable', storageKey: 'openRecordId_accountsReceivable' }
  }
  if (norm.includes('accrual') || norm.includes('costaccrual')) {
    return { routePath: '/finance/cost-accruals', storageKey: 'openRecordId_costAccrual' }
  }
  if (norm.includes('ledger') || norm.includes('generalledger')) {
    return { routePath: '/finance/general-ledger', storageKey: 'openRecordId_generalLedger' }
  }
  if (norm.includes('user') || norm.includes('useraccount')) {
    return { routePath: '/admin-settings/users', storageKey: 'openRecordId_userAccount' }
  }
  if (norm.includes('role')) {
    return { routePath: '/admin-settings/roles', storageKey: 'openRecordId_role' }
  }
  if (norm.includes('module')) {
    return { routePath: '/admin-settings/modules', storageKey: 'openRecordId_moduleControl' }
  }
  if (norm.includes('audit')) {
    return { routePath: '/admin-settings/audit-logs', storageKey: 'openRecordId_auditLog' }
  }

  return { routePath: '/logistics/shipments', storageKey: 'openRecordId_shipment' }
}

export function navigateToRecord(resourceName: string, recordId: string) {
  const { routePath, storageKey } = getRouteForResource(resourceName)
  localStorage.setItem(storageKey, recordId)
  localStorage.setItem(`openRecordId_${resourceName}`, recordId)
  window.location.href = `${routePath}?id=${encodeURIComponent(recordId)}`
}

