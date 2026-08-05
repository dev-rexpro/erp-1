-- =============================================================================
-- ERP-ONE SNOWFLAKE SCHEMA — MASBRO AI DATA LAYER
-- Database: ERP_ONE_DB
-- Schema: REXINDO_PROD
-- Scope: PT Rexindo Aruna Sedaya — Freight Forwarding, Indonesia/ASEAN
-- Hackathon: Snowflake CoCo CLI Hackathon 2026
-- =============================================================================

-- Create database & schema
USE ROLE ACCOUNTADMIN;
CREATE DATABASE IF NOT EXISTS ERP_ONE_DB;
USE DATABASE ERP_ONE_DB;
CREATE SCHEMA IF NOT EXISTS ERP_ONE_DB.REXINDO_PROD;
USE SCHEMA ERP_ONE_DB.REXINDO_PROD;

-- =============================================================================
-- TABLE: ERP_CLIENTS
-- Master data for all client companies (CN, SG, US, JP, AE)
-- =============================================================================
CREATE OR REPLACE TABLE ERP_CLIENTS (
    CLIENT_ID           VARCHAR(10)     NOT NULL PRIMARY KEY,  -- e.g. CN-001
    CLIENT_NAME         VARCHAR(200)    NOT NULL,
    SHORT_NAME          VARCHAR(100),
    INITIALS            VARCHAR(5),
    COUNTRY_CODE        VARCHAR(3)      NOT NULL,              -- ID, CN, SG, US, JP, AE
    CITY                VARCHAR(100),
    ADDRESS             VARCHAR(500),
    EMAIL               VARCHAR(200),
    PHONE               VARCHAR(50),
    TAX_ID              VARCHAR(100),
    TIER                VARCHAR(20),                           -- Priority, Standard, Non-priority
    INDUSTRY            VARCHAR(200),
    CURRENCY            VARCHAR(10)     DEFAULT 'USD',
    CREATED_AT          TIMESTAMP_NTZ   DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT          TIMESTAMP_NTZ   DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- TABLE: ERP_PORTS
-- UN/LOCODE port reference
-- =============================================================================
CREATE OR REPLACE TABLE ERP_PORTS (
    LOCODE              VARCHAR(10)     NOT NULL PRIMARY KEY,  -- e.g. IDJKT
    PORT_NAME           VARCHAR(200)    NOT NULL,
    CITY                VARCHAR(100),
    COUNTRY_CODE        VARCHAR(3),
    LONGITUDE           FLOAT,
    LATITUDE            FLOAT,
    PORT_TYPE           VARCHAR(10)                            -- sea, air, both
);

-- =============================================================================
-- TABLE: ERP_SERVICE_QUOTATIONS
-- Freight quotations issued to clients
-- =============================================================================
CREATE OR REPLACE TABLE ERP_SERVICE_QUOTATIONS (
    QUOTATION_ID        VARCHAR(20)     NOT NULL PRIMARY KEY,  -- QT-2026-1000
    CLIENT_ID           VARCHAR(10)     REFERENCES ERP_CLIENTS(CLIENT_ID),
    CLIENT_NAME         VARCHAR(200),
    CLIENT_COUNTRY      VARCHAR(3),
    QUOTATION_NUMBER    VARCHAR(20),
    STATUS              VARCHAR(20),                           -- active/inactive/invited/suspended
    STATUS_LABEL        VARCHAR(30),                           -- Accepted/Expired/Draft/Rejected
    SERVICE_MODE        VARCHAR(20),                           -- superadmin/admin/manager/cashier
    SERVICE_LABEL       VARCHAR(100),                          -- Air Freight / Ocean FCL / etc
    COMMODITY           VARCHAR(200),
    HS_CODE             VARCHAR(20),
    ORIGIN_LOCODE       VARCHAR(10)     REFERENCES ERP_PORTS(LOCODE),
    DEST_LOCODE         VARCHAR(10)     REFERENCES ERP_PORTS(LOCODE),
    VESSEL_NAME         VARCHAR(200),
    VOYAGE_NUMBER       VARCHAR(20),
    CONTAINER_TYPE      VARCHAR(10),                           -- 20GP, 40GP, 40HC
    TRANSIT_DAYS        INT,
    ETD                 DATE,
    VALID_UNTIL         DATE,
    INCOTERM            VARCHAR(10),                           -- FOB, CFR, CIF, EXW, DDP
    TOTAL_AMOUNT_USD    FLOAT,
    FREIGHT_CHARGE_USD  FLOAT,
    SURCHARGE_USD       FLOAT,
    HANDLING_FEE_USD    FLOAT,
    CURRENCY            VARCHAR(10)     DEFAULT 'USD',
    CREATED_AT          TIMESTAMP_NTZ,
    UPDATED_AT          TIMESTAMP_NTZ
);

-- =============================================================================
-- TABLE: ERP_SHIPMENTS
-- Active and historical freight shipments
-- =============================================================================
CREATE OR REPLACE TABLE ERP_SHIPMENTS (
    SHIPMENT_ID         VARCHAR(20)     NOT NULL PRIMARY KEY,  -- SHP-2026-1000
    CLIENT_ID           VARCHAR(10)     REFERENCES ERP_CLIENTS(CLIENT_ID),
    CLIENT_NAME         VARCHAR(200),
    CLIENT_COUNTRY      VARCHAR(3),
    CLIENT_TIER         VARCHAR(20),
    SHIPMENT_NUMBER     VARCHAR(20),
    STATUS              VARCHAR(20),                           -- active/inactive/invited/suspended
    STATUS_LABEL        VARCHAR(30),                           -- In Transit/Delivered/Scheduled/Delayed
    CARRIER_MODE        VARCHAR(20),                           -- superadmin/admin/manager/cashier
    COMMODITY           VARCHAR(200),
    HS_CODE             VARCHAR(20),
    TEMP_CONTROL        BOOLEAN         DEFAULT FALSE,
    ORIGIN_LOCODE       VARCHAR(10)     REFERENCES ERP_PORTS(LOCODE),
    DEST_LOCODE         VARCHAR(10)     REFERENCES ERP_PORTS(LOCODE),
    ROUTE_LABEL         VARCHAR(200),
    VESSEL_NAME         VARCHAR(200),
    VESSEL_CARRIER      VARCHAR(100),
    VOYAGE_NO           VARCHAR(20),
    FLIGHT_NO           VARCHAR(20),
    BL_NUMBER           VARCHAR(30),
    CONTAINER_NO        VARCHAR(20),
    CONTAINER_TYPE      VARCHAR(10),
    WEIGHT_KG           FLOAT,
    CBM                 FLOAT,
    TRANSIT_DAYS        INT,
    PROGRESS_PCT        INT,
    INCOTERM            VARCHAR(10),
    FREIGHT_USD         FLOAT,
    PIB_NUMBER          VARCHAR(30),                           -- CEISA import declaration
    CUSTOMS_STATUS      VARCHAR(30),                           -- CLEARED, HOLD, UNDER REVIEW, etc.
    ETA_DATE            DATE,
    LINKED_INVOICE      VARCHAR(20),
    LINKED_QUOTATION    VARCHAR(20),
    CREATED_AT          TIMESTAMP_NTZ,
    UPDATED_AT          TIMESTAMP_NTZ
);

-- =============================================================================
-- TABLE: ERP_CLIENT_INVOICES
-- Issued client invoices (Commercial, Proforma, Tax/Faktur Pajak, Credit Note)
-- =============================================================================
CREATE OR REPLACE TABLE ERP_CLIENT_INVOICES (
    INVOICE_ID          VARCHAR(20)     NOT NULL PRIMARY KEY,  -- INV-2026-1000
    CLIENT_ID           VARCHAR(10)     REFERENCES ERP_CLIENTS(CLIENT_ID),
    CLIENT_NAME         VARCHAR(200),
    CLIENT_COUNTRY      VARCHAR(3),
    CLIENT_TAX_ID       VARCHAR(100),
    CLIENT_TIER         VARCHAR(20),
    INVOICE_NUMBER      VARCHAR(20),
    STATUS              VARCHAR(20),                           -- active/inactive/invited/suspended
    STATUS_LABEL        VARCHAR(30),                           -- Paid/Overdue/Draft/Canceled
    INVOICE_TYPE        VARCHAR(20),                           -- superadmin/admin/manager/cashier
    INVOICE_TYPE_LABEL  VARCHAR(100),                          -- Commercial/Proforma/Tax/Credit Note
    COMMODITY           VARCHAR(200),
    HS_CODE             VARCHAR(20),
    SERVICE_TYPE        VARCHAR(20),
    SERVICE_LABEL       VARCHAR(100),
    AMOUNT_USD          FLOAT,
    VAT_AMOUNT_USD      FLOAT,
    AMOUNT_IDR          FLOAT,
    CURRENCY            VARCHAR(10)     DEFAULT 'USD',
    PO_NUMBER           VARCHAR(30),
    DUE_DATE            DATE,
    LINKED_SHIPMENT     VARCHAR(20),
    LINKED_QUOTATION    VARCHAR(20),
    ISSUED_DATE         TIMESTAMP_NTZ,
    UPDATED_AT          TIMESTAMP_NTZ
);

-- =============================================================================
-- TABLE: ERP_CUSTOMS_DECLARATIONS
-- CEISA 4.0 simulation — PIB (import) and PEB (export) declarations
-- =============================================================================
CREATE OR REPLACE TABLE ERP_CUSTOMS_DECLARATIONS (
    DECLARATION_ID      VARCHAR(30)     NOT NULL PRIMARY KEY,
    DOC_TYPE            VARCHAR(5)      NOT NULL,              -- PIB or PEB
    DOC_NUMBER          VARCHAR(30)     NOT NULL,              -- PIB-2026-0400
    SHIPMENT_REF        VARCHAR(20),
    CLIENT_ID           VARCHAR(10)     REFERENCES ERP_CLIENTS(CLIENT_ID),
    CLIENT_NAME         VARCHAR(200),
    ORIGIN_LOCODE       VARCHAR(10),
    DEST_LOCODE         VARCHAR(10),
    COMMODITY           VARCHAR(200),
    HS_CODE             VARCHAR(20),
    GROSS_WEIGHT_KG     FLOAT,
    CIF_USD             FLOAT,
    DUTY_USD            FLOAT,
    VAT_USD             FLOAT,
    STATUS              VARCHAR(30),                           -- APPROVED/IN PROGRESS/HOLD/etc.
    SUBMITTED_AT        TIMESTAMP_NTZ,
    CLEARED_AT          TIMESTAMP_NTZ,
    HOLD_REASON         VARCHAR(500),
    OFFICER_NOTE        VARCHAR(500),
    PORT_OF_ENTRY       VARCHAR(200),
    LINKED_SHIPMENT     VARCHAR(20),
    LINKED_INVOICE      VARCHAR(20)
);

-- =============================================================================
-- TABLE: ERP_VENDOR_RATES
-- Simulated shipping rates from carriers (OOCL, Maersk, MSC, etc.)
-- Used by Masbro for rate comparison queries
-- =============================================================================
CREATE OR REPLACE TABLE ERP_VENDOR_RATES (
    RATE_ID             VARCHAR(30)     NOT NULL PRIMARY KEY,
    CARRIER             VARCHAR(100),                          -- OOCL, Maersk, MSC, Evergreen
    ORIGIN_LOCODE       VARCHAR(10),
    DEST_LOCODE         VARCHAR(10),
    CONTAINER_TYPE      VARCHAR(10),                           -- 20GP, 40GP, 40HC
    RATE_USD            FLOAT,
    CURRENCY            VARCHAR(10)     DEFAULT 'USD',
    TRANSIT_DAYS        INT,
    DEPARTURE_DATE      DATE,
    VALID_FROM          DATE,
    VALID_TO            DATE,
    SERVICE_NAME        VARCHAR(100),                          -- AEX1, JSA, etc.
    SURCHARGE_USD       FLOAT,
    CREATED_AT          TIMESTAMP_NTZ   DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- SAMPLE VENDOR RATES (Masbro rate comparison simulation)
-- Routes: Jakarta (IDJKT) to major destinations
-- =============================================================================
INSERT INTO ERP_VENDOR_RATES VALUES
-- Jakarta → Shanghai
('RT-001', 'OOCL',     'IDJKT', 'CNSHA', '20GP', 850,  'USD', 10, '2026-08-04', '2026-07-26', '2026-08-31', 'AEX5',  120, CURRENT_TIMESTAMP()),
('RT-002', 'Maersk',   'IDJKT', 'CNSHA', '20GP', 920,  'USD', 10, '2026-08-03', '2026-07-26', '2026-08-31', 'AE-1',  145, CURRENT_TIMESTAMP()),
('RT-003', 'MSC',      'IDJKT', 'CNSHA', '20GP', 780,  'USD', 12, '2026-08-06', '2026-07-26', '2026-08-31', 'JADE',  110, CURRENT_TIMESTAMP()),
('RT-004', 'OOCL',     'IDJKT', 'CNSHA', '40HC', 1450, 'USD', 10, '2026-08-04', '2026-07-26', '2026-08-31', 'AEX5',  180, CURRENT_TIMESTAMP()),
('RT-005', 'Maersk',   'IDJKT', 'CNSHA', '40HC', 1580, 'USD', 10, '2026-08-03', '2026-07-26', '2026-08-31', 'AE-1',  220, CURRENT_TIMESTAMP()),
-- Jakarta → Singapore
('RT-011', 'PIL',      'IDJKT', 'SGSIN', '20GP', 220,  'USD', 3,  '2026-08-01', '2026-07-26', '2026-08-31', 'IMX',    45, CURRENT_TIMESTAMP()),
('RT-012', 'Maersk',   'IDJKT', 'SGSIN', '20GP', 285,  'USD', 3,  '2026-08-02', '2026-07-26', '2026-08-31', 'AAX',    55, CURRENT_TIMESTAMP()),
('RT-013', 'PIL',      'IDJKT', 'SGSIN', '40HC', 380,  'USD', 3,  '2026-08-01', '2026-07-26', '2026-08-31', 'IMX',    65, CURRENT_TIMESTAMP()),
-- Jakarta → Los Angeles
('RT-021', 'Evergreen', 'IDJKT', 'USLAX', '20GP', 2100, 'USD', 24, '2026-08-05', '2026-07-26', '2026-08-31', 'AEX3', 320, CURRENT_TIMESTAMP()),
('RT-022', 'COSCO',    'IDJKT', 'USLAX', '20GP', 1950, 'USD', 26, '2026-08-08', '2026-07-26', '2026-08-31', 'PKX',  290, CURRENT_TIMESTAMP()),
('RT-023', 'Maersk',   'IDJKT', 'USLAX', '20GP', 2280, 'USD', 23, '2026-08-04', '2026-07-26', '2026-08-31', 'AE-7', 350, CURRENT_TIMESTAMP()),
('RT-024', 'Evergreen', 'IDJKT', 'USLAX', '40HC', 3800, 'USD', 24, '2026-08-05', '2026-07-26', '2026-08-31', 'AEX3', 520, CURRENT_TIMESTAMP()),
-- Jakarta → Yokohama
('RT-031', 'ONE',      'IDJKT', 'JPYOK', '20GP', 780,  'USD', 10, '2026-08-03', '2026-07-26', '2026-08-31', 'IEX1', 120, CURRENT_TIMESTAMP()),
('RT-032', 'NYK',      'IDJKT', 'JPYOK', '20GP', 850,  'USD', 9,  '2026-08-02', '2026-07-26', '2026-08-31', 'JEX',  135, CURRENT_TIMESTAMP()),
('RT-033', 'ONE',      'IDJKT', 'JPYOK', '40HC', 1350, 'USD', 10, '2026-08-03', '2026-07-26', '2026-08-31', 'IEX1', 195, CURRENT_TIMESTAMP()),
-- Jakarta → Jebel Ali (Dubai)
('RT-041', 'OOCL',     'IDJKT', 'AEJEA', '20GP', 1200, 'USD', 18, '2026-08-06', '2026-07-26', '2026-08-31', 'MEX3', 195, CURRENT_TIMESTAMP()),
('RT-042', 'MSC',      'IDJKT', 'AEJEA', '20GP', 1080, 'USD', 20, '2026-08-09', '2026-07-26', '2026-08-31', 'IMEX', 170, CURRENT_TIMESTAMP()),
('RT-043', 'CMA CGM',  'IDJKT', 'AEJEA', '20GP', 1150, 'USD', 19, '2026-08-07', '2026-07-26', '2026-08-31', 'FAR3', 185, CURRENT_TIMESTAMP());

-- =============================================================================
-- CORTEX AI SEARCH INDEXES (Optional for Enterprise Accounts)
-- =============================================================================
-- ALTER TABLE ERP_SHIPMENTS ADD SEARCH OPTIMIZATION ON EQUALITY(STATUS, CLIENT_NAME, COMMODITY, HS_CODE);
-- ALTER TABLE ERP_CLIENT_INVOICES ADD SEARCH OPTIMIZATION ON EQUALITY(STATUS, CLIENT_NAME, INVOICE_NUMBER);
-- ALTER TABLE ERP_CUSTOMS_DECLARATIONS ADD SEARCH OPTIMIZATION ON EQUALITY(STATUS, DOC_NUMBER, CLIENT_NAME);

-- =============================================================================
-- VIEWS — Pre-built for Masbro AI queries
-- =============================================================================

-- View: Active shipments with overdue ETA
CREATE OR REPLACE VIEW ERP_ONE_DB.REXINDO_PROD.V_OVERDUE_SHIPMENTS AS
SELECT
    s.SHIPMENT_NUMBER,
    s.CLIENT_NAME,
    s.CLIENT_COUNTRY,
    s.COMMODITY,
    s.ROUTE_LABEL,
    s.ETA_DATE,
    s.CUSTOMS_STATUS,
    s.BL_NUMBER,
    s.CONTAINER_NO,
    DATEDIFF('day', s.ETA_DATE, CURRENT_DATE()) AS DAYS_OVERDUE
FROM ERP_ONE_DB.REXINDO_PROD.ERP_SHIPMENTS s
WHERE s.STATUS = 'suspended'
   OR (s.STATUS = 'active' AND s.ETA_DATE < CURRENT_DATE())
ORDER BY DAYS_OVERDUE DESC;

-- View: AR Aging — outstanding invoices
CREATE OR REPLACE VIEW ERP_ONE_DB.REXINDO_PROD.V_AR_AGING AS
SELECT
    i.INVOICE_NUMBER,
    i.CLIENT_NAME,
    i.CLIENT_COUNTRY,
    i.AMOUNT_USD,
    i.DUE_DATE,
    i.STATUS_LABEL,
    DATEDIFF('day', i.DUE_DATE, CURRENT_DATE()) AS DAYS_OVERDUE,
    CASE
        WHEN DATEDIFF('day', i.DUE_DATE, CURRENT_DATE()) <= 0 THEN 'Current'
        WHEN DATEDIFF('day', i.DUE_DATE, CURRENT_DATE()) <= 30 THEN '1-30 days'
        WHEN DATEDIFF('day', i.DUE_DATE, CURRENT_DATE()) <= 60 THEN '31-60 days'
        ELSE '60+ days'
    END AS AGING_BUCKET
FROM ERP_ONE_DB.REXINDO_PROD.ERP_CLIENT_INVOICES i
WHERE i.STATUS IN ('inactive', 'invited')  -- Overdue or Draft
ORDER BY DAYS_OVERDUE DESC;

-- View: Customs holds requiring action
CREATE OR REPLACE VIEW ERP_ONE_DB.REXINDO_PROD.V_CUSTOMS_ALERTS AS
SELECT
    d.DOC_TYPE,
    d.DOC_NUMBER,
    d.CLIENT_NAME,
    d.COMMODITY,
    d.HS_CODE,
    d.STATUS,
    d.HOLD_REASON,
    d.OFFICER_NOTE,
    d.PORT_OF_ENTRY,
    d.SUBMITTED_AT,
    DATEDIFF('hour', d.SUBMITTED_AT, CURRENT_TIMESTAMP()) AS HOURS_SINCE_SUBMISSION
FROM ERP_ONE_DB.REXINDO_PROD.ERP_CUSTOMS_DECLARATIONS d
WHERE d.STATUS IN ('HOLD', 'UNDER REVIEW', 'PENDING')
ORDER BY HOURS_SINCE_SUBMISSION DESC;

-- View: Revenue summary by country
CREATE OR REPLACE VIEW ERP_ONE_DB.REXINDO_PROD.V_REVENUE_BY_COUNTRY AS
SELECT
    i.CLIENT_COUNTRY,
    COUNT(*) AS INVOICE_COUNT,
    SUM(i.AMOUNT_USD) AS TOTAL_USD,
    AVG(i.AMOUNT_USD) AS AVG_USD,
    SUM(CASE WHEN i.STATUS = 'active' THEN i.AMOUNT_USD ELSE 0 END) AS PAID_USD,
    SUM(CASE WHEN i.STATUS = 'inactive' THEN i.AMOUNT_USD ELSE 0 END) AS OVERDUE_USD
FROM ERP_ONE_DB.REXINDO_PROD.ERP_CLIENT_INVOICES i
GROUP BY i.CLIENT_COUNTRY
ORDER BY TOTAL_USD DESC;

-- =============================================================================
-- SAMPLE CORTEX AI QUERY (Masbro uses this pattern)
-- Natural language → SQL via Cortex Complete
-- =============================================================================
/*
Example Masbro AI query:
SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'mistral-7b',
  CONCAT(
    'You are Masbro, an AI assistant for PT Rexindo Aruna Sedaya freight forwarding ERP. ',
    'Answer in Indonesian, be concise and actionable. ',
    'User question: ', :user_question,
    ' Context data: ', :context_data
  )
) AS masbro_response;
*/

-- =============================================================================
-- MIGRATION NOTES
-- Run after creating tables:
-- 1. Load ERP_CLIENTS from src/lib/mock-data/master-data.ts clientCompanies[]
-- 2. Load ERP_PORTS from src/lib/mock-data/master-data.ts ports[]
-- 3. Load ERP_SERVICE_QUOTATIONS from src/features/service-quotations/data/quotations.ts
-- 4. Load ERP_SHIPMENTS from src/features/shipments/data/shipments.ts
-- 5. Load ERP_CLIENT_INVOICES from src/features/client-invoices/data/invoices.ts
-- 6. Load ERP_CUSTOMS_DECLARATIONS from src/lib/mock-data/customs-declarations.ts
-- Vendor rates are pre-inserted above.
-- =============================================================================
