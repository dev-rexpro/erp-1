import { Archive, CircleHelp, File, Inbox, Keyboard, type LucideIcon, Send, Star, Trash2 } from "lucide-react";
import { siFigma, siGoogledocs, siGooglephotos } from "simple-icons";

const fadhlurRahman = {
  name: "Fadhlur Rahman (ICT Manager)",
  email: "fdrahman@rexcorp.id",
};

const bambangSugianto = {
  name: "Bambang Sugianto (Operation Manager)",
  email: "bambang.sugianto@rexcorp.id",
};

const rizkyPratama = {
  name: "Rizky Pratama (Export Officer)",
  email: "rizky.pratama@rexcorp.id",
};

const erpOneLogistics = {
  name: "Rexcorp Global Trade Ops",
  email: "ops@rexcorp.id",
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

export type Recipient = {
  name: string;
  email: string;
};

export type Attachment = {
  id: string;
  name: string;
  size: string;
  icon: typeof siFigma;
};

export type Mail = {
  id: string;
  accountId: number;
  from: Recipient;
  to: Recipient[];
  cc?: Recipient[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive" | "trash";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: Attachment[];
  messageCount?: number;
};

export type MailNavItem = {
  id: string;
  title: string;
  label?: string;
  icon: LucideIcon;
  isActive: boolean;
};

type MailNavigation = {
  navMain: MailNavItem[];
  folders: MailNavItem[];
  navFooter: MailNavItem[];
};

export const mails: Mail[] = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    accountId: 1,
    from: {
      name: "William Smith (Maersk)",
      email: "w.smith@maersk.com",
    },
    to: [fadhlurRahman],
    cc: [erpOneLogistics],
    subject: "Vessel Schedule & Space Confirmation #SHP-2026-089",
    body: "Dear Fadhlur,\n\nWe are pleased to confirm space allocation for 10x40ft HC containers on MV Maersk Seletar V.2608E sailing from Tanjung Priok to Rotterdam.\n\nClosing Date: Sunday, Aug 10, 18:00 WIB\nShipping Instruction (SI) Deadline: Saturday noon\n\nAttached are the booking confirmation and draft BL specs for your review.\n\nBest regards,\nWilliam Smith\nMaersk Line Operations",
    receivedAt: minutesAgo(24),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: true,
    labels: ["export", "shipping", "urgent"],
    attachments: [
      {
        id: "booking-confirm-fig",
        name: "booking-confirmation-SHP089.pdf",
        size: "2.4 MB",
        icon: siGoogledocs,
      },
      {
        id: "draft-bl-docx",
        name: "draft-bill-of-lading.docx",
        size: "1.7 MB",
        icon: siGoogledocs,
      },
    ],
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    accountId: 2,
    from: {
      name: "Siti Nurhaliza (Customs)",
      email: "siti.nurhaliza@customs-agency.co.id",
    },
    to: [erpOneLogistics],
    subject: "Re: PEB & PIB Customs Clearance Update for Tanjung Priok",
    body: "Halo Pak Fadhlur,\n\nPemberitahuan Ekspor Barang (PEB) no. 008912/BC/2026 telah disetujui oleh Bea Cukai. Surat Persetujuan Pengeluaran Barang (SPPB) sudah terbit secara elektronik melalui sistem INSW.\n\nSemua kontainer siap gate-in di Terminal 3 KOJA.\n\nSalam,\nSiti Nurhaliza\nCustoms Brokerage Supervisor",
    receivedAt: hoursAgo(2),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["customs", "peb", "approved"],
    attachments: [
      {
        id: "sppb-release-docx",
        name: "SPPB-Release-Note.pdf",
        size: "850 KB",
        icon: siGoogledocs,
      },
    ],
    messageCount: 3,
  },
  {
    id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
    accountId: 1,
    from: {
      name: "Pak Bambang (Kawan Laju Transport)",
      email: "bambang.ops@kawanlaju-logistics.id",
    },
    to: [fadhlurRahman],
    subject: "Container Delivery Schedule to Cikarang Dry Port",
    body: "Pak Fadhlur,\n\nInforming trucking dispatch for 6 trailer trucks carrying raw materials to Cikarang Dry Port.\n\nDrivers are equipped with e-seal and port access pass. Real-time GPS tracking link is enabled in the ERP One fleet module.\n\nTerima kasih,\nBambang - Transport Ops",
    receivedAt: daysAgo(1),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["trucking", "logistics"],
  },
  {
    id: "61c35085-72d7-42b4-8d62-738f700d4b92",
    accountId: 1,
    from: {
      name: "Emily Davis (Finance)",
      email: "emily.davis@erp-one.id",
    },
    to: [fadhlurRahman],
    subject: "Re: Ocean Freight & THC Invoice Reconciliation #INV-4821",
    body: "Hi Fadhlur,\n\nI have reviewed the invoice breakdown for shipment #SHP-2026-074. The Terminal Handling Charges (THC) and Bunker Adjustment Factor (BAF) have been matched against Samudera Line tariff sheets.\n\nAttached is the verified billing breakdown ready for disbursement approval.\n\nRegards,\nEmily Davis\nFreight Finance Dept",
    receivedAt: daysAgo(2),
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["finance", "invoice"],
    attachments: [
      {
        id: "thc-breakdown-docx",
        name: "freight-cost-breakdown.xlsx",
        size: "1.2 MB",
        icon: siGoogledocs,
      },
    ],
    messageCount: 2,
  },
  {
    id: "8f7b5db9-d935-4e42-8e05-1f1d0a3dfb97",
    accountId: 2,
    from: {
      name: "Capt. Michael Wilson (Pelindo)",
      email: "m.wilson@pelindo.co.id",
    },
    to: [erpOneLogistics],
    subject: "Berthing Slot Confirmation - MV Samudera Express V.2026",
    body: "Attention Freight Operations,\n\nMV Samudera Express V.2026 berthing slot confirmed at Berth 04 Tanjung Priok Port.\n\nETA: 08 Aug 2026, 06:00 WIB\nETD: 09 Aug 2026, 22:00 WIB\n\nPlease ensure all export containers complete gate-in prior to cargo cutoff.\n\nRegards,\nPort Operations Terminal 2 Pelindo",
    receivedAt: daysAgo(3),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: true,
    labels: ["port", "berthing", "important"],
  },
  {
    id: "1f0f2c02-e299-40de-9b1d-86ef9e42126b",
    accountId: 1,
    from: {
      name: "Sarah Brown (Doc Control)",
      email: "sarah.brown@erp-one.id",
    },
    to: [fadhlurRahman],
    subject: "Re: Bill of Lading & Commercial Invoice Draft for Export",
    body: "Hi Fadhlur,\n\nAttached is the revised draft Bill of Lading (B/L) and Commercial Invoice for shipment PT Mayora Global Export to Shanghai.\n\nPlease verify shipper, consignee, and HS Code details before we send it to COSCO documentation desk.\n\nThanks,\nSarah Brown",
    receivedAt: daysAgo(5),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["documentation", "bl-draft"],
    attachments: [
      {
        id: "draft-bl-fig",
        name: "BL-Draft-PTMayora.pdf",
        size: "3.1 MB",
        icon: siGoogledocs,
      },
    ],
  },
  {
    id: "17c0a96d-4415-42b1-8b4f-764efab57f66",
    accountId: 2,
    from: {
      name: "David Lee (Commercial Export)",
      email: "david.lee@agropalm.co.id",
    },
    to: [erpOneLogistics],
    cc: [fadhlurRahman],
    subject: "New Route Inquiry: Direct Shipment Surabaya to Jebel Ali",
    body: "Dear ERP One Team,\n\nWe have 15x40ft HC containers of palm oil products for monthly shipment from Surabaya (Teluk Lamong) to Jebel Ali Port, Dubai.\n\nKindly provide ocean freight quotations, free time detention terms, and transit time schedules.\n\nBest regards,\nDavid Lee\nPT Agro Palm Indonesia",
    receivedAt: daysAgo(8),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["inquiry", "quotation"],
  },
  {
    id: "2f0130cb-39fc-44c4-bb3c-0a4337edaaab",
    accountId: 1,
    from: {
      name: "Olivia Wilson (Jasindo)",
      email: "olivia.wilson@jasindo.co.id",
    },
    to: [fadhlurRahman],
    subject: "Cargo Marine Insurance Policy #POL-9921 Approval",
    body: "Dear Fadhlur,\n\nMarine Insurance Policy #POL-9921 under Institute Cargo Clauses (A) has been issued for cargo value USD 450,000.\n\nCoverage includes transshipment risk at Singapore Port and warehouse-to-warehouse transport.\n\nPolicy certificate is attached.\n\nSincerely,\nOlivia Wilson - Marine Insurance Dept",
    receivedAt: daysAgo(12),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["insurance", "policy"],
  },
  {
    id: "de305d54-75b4-431b-adb2-eb6b9e546014",
    accountId: 2,
    from: {
      name: "James Martin (Sucofindo)",
      email: "james.martin@sucofindo.co.id",
    },
    to: [erpOneLogistics],
    subject: "Re: Pre-Shipment Surveyor Inspection Certificate (LSI)",
    body: "Dear Team,\n\nPre-shipment inspection for 2,000 MT RBD Palm Olein at Belawan Port has been completed. Laporan Surveyor Ekspor (LSI) is verified and clean.\n\nCertificate copy attached for PEB attachment.\n\nRegards,\nJames Martin\nPT Sucofindo Surveyor",
    receivedAt: daysAgo(18),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["surveyor", "inspection"],
    attachments: [
      {
        id: "lsi-cert-png",
        name: "LSI-Certificate-Belawan.pdf",
        size: "1.1 MB",
        icon: siGoogledocs,
      },
    ],
  },
  {
    id: "7dd90c63-00f6-40f3-bd87-5060a24e8ee7",
    accountId: 1,
    from: {
      name: "Sophia White (PT Mayora)",
      email: "sophia.white@mayoraglobal.com",
    },
    to: [fadhlurRahman],
    subject: "Booking Confirmation & Container Release Note",
    body: "Hi Fadhlur,\n\nThank you for assisting our 5 containers shipment to Guangzhou.\n\nWe have received the equipment interchange receipt (EIR) and container pickup authorization for depot Cilincing.\n\nBest regards,\nSophia White",
    receivedAt: daysAgo(24),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["booking", "export"],
  },
  {
    id: "99a88f78-3eb4-4d87-87b7-7b15a49a0a05",
    accountId: 2,
    from: {
      name: "Daniel Johnson (PLB Warehouse)",
      email: "daniel.j@plb-cikarang.id",
    },
    to: [erpOneLogistics],
    subject: "Inbound Bonded Goods Inspection Report (BC 1.6)",
    body: "Halo Tim ERP One,\n\nLaporan penerimaan barang impor di Pusat Logistik Berikat (PLB) Cikarang dengan dokumen BC 1.6 telah selesai.\n\nJumlah koli dan segel kontainer sesuai manifest. Data barang telah disinkronkan ke module PLB ERP One.\n\nSalam,\nDaniel Johnson",
    receivedAt: daysAgo(31),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["warehouse", "bonded"],
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    accountId: 1,
    from: {
      name: "Ava Taylor (Customs Compliance)",
      email: "ava.taylor@trade-gov.id",
    },
    to: [fadhlurRahman],
    subject: "Re: Form E Certificate of Origin (ASEAN-China)",
    body: "Pak Fadhlur,\n\nAplikasi e-Form E no. COO-2026-8812 untuk pengiriman ke Shanghai telah disetujui oleh Dinas Perdagangan.\n\nFile digital bertanda tangan elektronik dapat diunduh langsung di ERP One Document Hub.\n\nSalam,\nAva Taylor",
    receivedAt: daysAgo(45),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["form-e", "coo"],
  },
  {
    id: "c1a0ecb4-2540-49c5-86f8-21e5ce79e4e6",
    accountId: 2,
    from: {
      name: "William Anderson (Evergreen)",
      email: "w_anderson@evergreen-marine.com",
    },
    to: [erpOneLogistics],
    subject: "Q3 Container Shipping Rate & Surcharge Adjustment Notice",
    body: "Dear Valued Partner,\n\nPlease find attached the updated Q3 ocean freight tariff schedule and Peak Season Surcharge (PSS) notice for Far East and Europe trade lanes.\n\nEffective date: 15 August 2026.\n\nBest regards,\nWilliam Anderson\nEvergreen Marine Corp",
    receivedAt: daysAgo(62),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["tariff", "surcharge"],
  },
  {
    id: "ba54eefd-4097-4949-99f2-2a9ae4d1a836",
    accountId: 1,
    from: {
      name: "Mia Harris (Samudera Shipping)",
      email: "mia.harris@samudera.id",
    },
    to: [fadhlurRahman],
    subject: "Re: Cargo Tracking & Gate-In Confirmation",
    body: "Hi Fadhlur,\n\nAll 4 containers for booking SMR-8812 have completed gate-in at Teluk Lamong terminal. Vessel loading is scheduled tonight at 23:00 WIB.\n\nThank you for the seamless coordination.\n\nMia Harris",
    receivedAt: daysAgo(75),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["tracking", "gate-in"],
  },
  {
    id: "df09b6ed-28bd-4e0c-85a9-9320ec5179aa",
    accountId: 2,
    from: {
      name: "Ethan Clark (Port Ops)",
      email: "ethan.clark@pelindo.co.id",
    },
    to: [erpOneLogistics],
    subject: "Port Operations & Demurrage Waiver Status",
    body: "Dear Freight Team,\n\nThe 3-day detention waiver request for container TCKU-99210 at Tanjung Priok Port has been approved.\n\nUpdated gate pass issued without penalty fees.\n\nRegards,\nEthan Clark\nTerminal Port Operations",
    receivedAt: daysAgo(92),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["port", "demurrage"],
  },
  {
    id: "d67c1842-7f8b-4b4b-9be1-1b3b1ab4611d",
    accountId: 1,
    from: {
      name: "Chloe Hall (Finance)",
      email: "chloe.hall@erp-one.id",
    },
    to: [fadhlurRahman],
    subject: "Re: Freight Forwarding Invoice Approval #INV-9021",
    body: "Hi Fadhlur,\n\nInvoice INV-9021 for ocean freight and customs handling has been approved by finance and scheduled for payment on Friday.\n\nReceipt copy will be generated automatically.\n\nBest,\nChloe Hall",
    receivedAt: daysAgo(118),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["finance", "approved"],
  },
  {
    id: "6c9a7f94-8329-4d70-95d3-51f68c186ae1",
    accountId: 2,
    from: {
      name: "Samuel Turner (Depot Cilincing)",
      email: "samuel.turner@depot-cilincing.co.id",
    },
    to: [erpOneLogistics],
    subject: "Empty Container Inspection & Release Authorization",
    body: "Pak Fadhlur,\n\n10 unit kontainer kosong 40ft High Cube kondisi Grade-A (Food Grade) telah disiapkan di Depot Cilincing.\n\nSurat Jalan Pelepasan Kontainer (SP2K) dapat langsung diserahkan ke driver armada.\n\nSalam,\nSamuel Turner",
    receivedAt: daysAgo(145),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["depot", "container"],
  },
];

export const mailNavigation: MailNavigation = {
  navMain: [
    {
      id: "inbox",
      title: "Inbox",
      label: "18",
      icon: Inbox,
      isActive: true,
    },
    {
      id: "priority",
      title: "Priority",
      label: "3",
      icon: Star,
      isActive: false,
    },
  ],
  folders: [
    {
      id: "drafts",
      title: "Drafts",
      label: "9",
      icon: File,
      isActive: false,
    },
    {
      id: "sent",
      title: "Sent",
      icon: Send,
      isActive: false,
    },
    {
      id: "archive",
      title: "Archive",
      icon: Archive,
      isActive: false,
    },
    {
      id: "trash",
      title: "Trash",
      icon: Trash2,
      isActive: false,
    },
  ],
  navFooter: [
    {
      id: "help-feedback",
      title: "Help & feedback",
      icon: CircleHelp,
      isActive: false,
    },
    {
      id: "keyboard-shortcuts",
      title: "Keyboard shortcuts",
      icon: Keyboard,
      isActive: false,
    },
  ],
};

export const accounts = [
  {
    id: 1,
    label: "Fadhlur Rahman",
    email: "fdrahman@rexcorp.id",
  },
  {
    id: 2,
    label: "ERP One Operations",
    email: "ops@erp-one.id",
  },
];
