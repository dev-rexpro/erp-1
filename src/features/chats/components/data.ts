import type { LucideIcon } from "lucide-react";
import { Clock3, Inbox, Mail, MessageCircle, Phone, Send, Star, User } from "lucide-react";

export type Conversation = {
  id: number;
  group: "Pinned" | "Today" | "Yesterday";
  name: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isOnline: boolean;
  unreadCount: number;
  contact: Contact;
  messages: Message[];
};

export type Message = {
  id: number;
  side: "in" | "out";
  text: string;
  time: string;
};

export type Contact = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  status: string;
  qualifiedAt: string;
  tags: string[];
};

export type NavItem = {
  id: string;
  title: string;
  label?: string;
  icon: LucideIcon;
  isActive: boolean;
};

export type ChannelItem = NavItem;

export type ViewItem = NavItem;

export const navItems: NavItem[] = [
  { id: "inbox", title: "Inbox", label: "24", icon: Inbox, isActive: true },
  { id: "mentions", title: "Mentions", label: "3", icon: Mail, isActive: false },
  { id: "snoozed", title: "Snoozed", icon: Clock3, isActive: false },
  { id: "sent", title: "Sent", icon: Send, isActive: false },
  { id: "all", title: "All conversations", icon: MessageCircle, isActive: false },
  { id: "unassigned", title: "Unassigned", label: "7", icon: User, isActive: false },
];

export const channelItems: ChannelItem[] = [
  { id: "email", title: "Email", label: "18", icon: Mail, isActive: false },
  { id: "chat", title: "Chat", label: "5", icon: MessageCircle, isActive: false },
  { id: "whatsapp", title: "WhatsApp", label: "1", icon: Phone, isActive: false },
  { id: "instagram", title: "Instagram", label: "0", icon: Phone, isActive: false },
  { id: "facebook", title: "Facebook", label: "0", icon: Phone, isActive: false },
  { id: "phone", title: "Phone", label: "0", icon: Phone, isActive: false },
];

export const viewItems: ViewItem[] = [
  { id: "shipping", title: "Active Shipments", label: "12", icon: Star, isActive: false },
  { id: "customs", title: "Customs PEB/PIB", label: "6", icon: Inbox, isActive: false },
  { id: "trucking", title: "Inland Logistics", label: "4", icon: MessageCircle, isActive: false },
];

export const conversations: Conversation[] = [
  // Pinned
  {
    id: 1,
    group: "Pinned",
    name: "Capt. Hendra Wijaya",
    subject: "Bill of Lading Draft & Container Release #SHP-2026-089",
    preview: "Customs PEB clearance approved at Tanjung Priok. Vessel ETD is scheduled tomorrow.",
    time: "Just now",
    isUnread: true,
    isOnline: true,
    unreadCount: 4,
    contact: {
      name: "Capt. Hendra Wijaya",
      role: "Port Operations & Liner Agent",
      company: "Evergreen Marine Corp",
      email: "h.wijaya@evergreen-marine.com",
      phone: "+62 811-9876-5432",
      website: "evergreen-marine.com",
      location: "Tanjung Priok, Jakarta, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "VIP Partner",
      qualifiedAt: "Mar 5, 2026",
      tags: ["Ocean Freight", "Customs", "P0 Priority"],
    },
    messages: [
      {
        id: 101,
        side: "in",
        text: "Customs PEB approval (NPE) has been issued for Container EVRG-981240. Vessel ETD is tomorrow at 16:00 WIB.",
        time: "10 min ago",
      },
      {
        id: 102,
        side: "out",
        text: "Thanks Capt. Hendra! I am verifying the Master BL draft against our packing list and commercial invoice now.",
        time: "8 min ago",
      },
      {
        id: 103,
        side: "in",
        text: "Please make sure notify party address matches PT Global Nusantara's updated tax registration ID.",
        time: "5 min ago",
      },
      {
        id: 104,
        side: "out",
        text: "Verified! Revised Draft BL has been sent back to the Evergreen documentation desk.",
        time: "3 min ago",
      },
      { id: 105, side: "in", text: "Received and confirmed. Container gate-in is verified at KOJA Terminal 3.", time: "1 min ago" },
    ],
  },
  {
    id: 2,
    group: "Pinned",
    name: "Phoenix Baker",
    subject: "Demurrage & Detention Free Time Extension Request #SHP-2026-074",
    preview: "Requesting 5-day free time extension at Teluk Lamong Port for 4x40ft HC reefers.",
    time: "5m",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Phoenix Baker",
      role: "Supply Chain Director",
      company: "PT Nusantara Eksportindo",
      email: "phoenix.baker@nusantara-eksport.co.id",
      phone: "+62 812-3456-7890",
      website: "nusantara-eksport.co.id",
      location: "Surabaya, Jawa Timur, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Key Client",
      qualifiedAt: "Jan 18, 2026",
      tags: ["Reefer Cargo", "Detention", "Surabaya"],
    },
    messages: [
      {
        id: 201,
        side: "in",
        text: "We have 4x40ft High Cube reefer containers arriving on MV OOCL Malaysia. Requesting 14 days free time instead of 9.",
        time: "5 min ago",
      },
      {
        id: 202,
        side: "out",
        text: "Thanks for flagging it, Phoenix. Checking with OOCL liner representative for detention waiver extension.",
        time: "4 min ago",
      },
      {
        id: 203,
        side: "in",
        text: "Appreciate the quick response. Our cold storage facility in Gresik is ready for unpacking on Monday.",
        time: "3 min ago",
      },
      {
        id: 204,
        side: "out",
        text: "Great news Phoenix, OOCL approved 12 days free time detention at Teluk Lamong port.",
        time: "2 min ago",
      },
      { id: 205, side: "in", text: "That works for us! Thanks for handling the waiver so smoothly.", time: "1 min ago" },
    ],
  },
  {
    id: 3,
    group: "Pinned",
    name: "Lana Steiner",
    subject: "Vessel Schedule Revision - MV Maersk Seletar V.2608E",
    preview: "ETD Belawan updated to Aug 10. Booking confirmations for export allotment ready.",
    time: "8m",
    isUnread: true,
    isOnline: false,
    unreadCount: 2,
    contact: {
      name: "Lana Steiner",
      role: "Key Account Manager",
      company: "A.P. Moller - Maersk",
      email: "lana.steiner@maersk.com",
      phone: "+62 813-8899-0011",
      website: "maersk.com",
      location: "Belawan Port, Medan, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Carrier Partner",
      qualifiedAt: "Apr 2, 2026",
      tags: ["Maersk", "CPO Export", "Belawan"],
    },
    messages: [
      {
        id: 301,
        side: "in",
        text: "Space allocation secured for 10x20ft GP containers on MV Maersk Seletar V.2608E to Rotterdam.",
        time: "8 min ago",
      },
      {
        id: 302,
        side: "out",
        text: "Thanks, Lana. What is the revised closing time for Belawan International Container Terminal?",
        time: "7 min ago",
      },
      {
        id: 303,
        side: "in",
        text: "Cargo cutoff is Sunday at 18:00 WIB. Shipping Instruction (SI) deadline is Saturday noon.",
        time: "5 min ago",
      },
      {
        id: 304,
        side: "out",
        text: "SI submitted through Maersk portal under Booking Ref: MTR-9082314.",
        time: "3 min ago",
      },
      { id: 305, side: "in", text: "Booking confirmed! Equipment pickup available at Belawan depot tomorrow morning.", time: "1 min ago" },
    ],
  },
  // Today
  {
    id: 5,
    group: "Today",
    name: "Siti Nurhaliza",
    subject: "PIB Import Duty Clearance #IMP-2026-012",
    preview: "Physical inspection (Jalur Merah) completed. SPPB release note issued by Customs.",
    time: "10:42 AM",
    isUnread: true,
    isOnline: true,
    unreadCount: 5,
    contact: {
      name: "Siti Nurhaliza",
      role: "Customs & Clearance Brokerage Supervisor",
      company: "PT Jasa Samudera Customs",
      email: "siti.nurhaliza@customs-agency.co.id",
      phone: "+62 815-4321-9876",
      website: "jasasamudera-customs.id",
      location: "Soekarno-Hatta Air Cargo Terminal",
      timezone: "WIB (UTC+7)",
      status: "Verified Broker",
      qualifiedAt: "Jan 22, 2026",
      tags: ["Customs Duty", "Import", "Air Cargo"],
    },
    messages: [
      {
        id: 501,
        side: "in",
        text: "Shipment AWB-88219 from Frankfurt assigned to Jalur Merah. Physical inspection scheduled for 14:00 today.",
        time: "10:42 AM",
      },
      {
        id: 502,
        side: "out",
        text: "Thanks Bu Siti. Our field officer pak Budi is already at TPS Air Cargo with the original COO (Form EUR.1).",
        time: "10:44 AM",
      },
      {
        id: 503,
        side: "in",
        text: "Good. Make sure the HS Code 8471.30 items match the catalog specifications exactly.",
        time: "10:47 AM",
      },
      {
        id: 504,
        side: "out",
        text: "Catalog and surveyor inspection certificate are attached to the PIB document package in ERP One.",
        time: "10:49 AM",
      },
      { id: 505, side: "in", text: "Inspection finished! SPPB (Surat Persetujuan Pengeluaran Barang) is now released.", time: "10:50 AM" },
    ],
  },
  {
    id: 6,
    group: "Today",
    name: "Candice Wu",
    subject: "Trucking Allocation & Inland Fleet Tracking #TRK-8821",
    preview: "8 prime mover trailer trucks dispatched for Pasuruan factory pickup.",
    time: "10:15 AM",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Candice Wu",
      role: "Transport & Fleet Coordinator",
      company: "Kawan Laju Transport",
      email: "candice.wu@kawanlaju-logistics.id",
      phone: "+62 838-5550-1721",
      website: "kawanlaju-logistics.id",
      location: "Surabaya, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Logistics Partner",
      qualifiedAt: "May 10, 2026",
      tags: ["Trucking", "Inland Transport", "GPS"],
    },
    messages: [
      {
        id: 601,
        side: "in",
        text: "8 prime mover trucks assigned for container haulage from Pasuruan factory to Perak port.",
        time: "10:15 AM",
      },
      {
        id: 602,
        side: "out",
        text: "Thanks, Candice. Are all drivers equipped with e-seals and port access passes?",
        time: "10:12 AM",
      },
      {
        id: 603,
        side: "in",
        text: "Yes, drivers have e-seals #SEAL-9901 to #SEAL-9908. Real-time GPS link is active.",
        time: "10:09 AM",
      },
      {
        id: 604,
        side: "out",
        text: "Great, factory loading started on schedule at 08:00 AM.",
        time: "10:06 AM",
      },
    ],
  },
  {
    id: 7,
    group: "Today",
    name: "Natali Craig",
    subject: "Ocean Freight & Terminal Handling Charges Invoice #INV-4821",
    preview: "Ocean freight & THC invoice USD 14,200 for 8x40ft dry containers to Dubai.",
    time: "9:58 AM",
    isUnread: true,
    isOnline: false,
    unreadCount: 1,
    contact: {
      name: "Natali Craig",
      role: "Freight Billing Manager",
      company: "Samudera Logistics Services",
      email: "natali.craig@samudera-logistics.id",
      phone: "+62 821-5555-0184",
      website: "samudera-logistics.id",
      location: "Jakarta, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Billing",
      qualifiedAt: "Oct 14, 2025",
      tags: ["Freight Invoice", "THC", "Finance"],
    },
    messages: [
      {
        id: 701,
        side: "in",
        text: "Invoice INV-2026-4821 for ocean freight & THC to Jebel Ali Port is generated.",
        time: "9:58 AM",
      },
      {
        id: 702,
        side: "out",
        text: "Thanks, Natali. Is Bunker Adjustment Factor (BAF) included in the breakdown?",
        time: "9:54 AM",
      },
      {
        id: 703,
        side: "in",
        text: "Yes, itemized breakdown: Ocean Freight USD 12,000, THC IDR 12M, BAF USD 1,200.",
        time: "9:50 AM",
      },
      {
        id: 704,
        side: "out",
        text: "Payment processed via TT transfer. Bank confirmation attached in ERP One Finance.",
        time: "9:46 AM",
      },
    ],
  },
  {
    id: 8,
    group: "Today",
    name: "Drew Cano",
    subject: "Bonded Warehouse Inbound Inspection #PLB-9021",
    preview: "20 palletized electronics items received under BC 1.6 document at PLB Cikarang.",
    time: "9:32 AM",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Drew Cano",
      role: "Warehouse Operations Manager",
      company: "PLB Cikarang Logistics Hub",
      email: "drew.cano@plb-cikarang.id",
      phone: "+62 811-555-0166",
      website: "plb-cikarang.id",
      location: "Cikarang Dry Port, Jawa Barat",
      timezone: "WIB (UTC+7)",
      status: "Bonded Warehouse",
      qualifiedAt: "Aug 3, 2025",
      tags: ["PLB", "BC 1.6", "Customs Warehouse"],
    },
    messages: [
      {
        id: 801,
        side: "in",
        text: "Inbound cargo under BC 1.6 document arrived at PLB Cikarang.",
        time: "9:32 AM",
      },
      {
        id: 802,
        side: "out",
        text: "Thanks Drew. Were there any seal damages or tally discrepancies?",
        time: "9:28 AM",
      },
      {
        id: 803,
        side: "in",
        text: "Seal intact, seal number matches BC 1.6 manifest. Barcode scanning complete.",
        time: "9:24 AM",
      },
      {
        id: 804,
        side: "out",
        text: "Perfect. Inventory stock updated in ERP One Bonded Warehouse module.",
        time: "9:20 AM",
      },
    ],
  },
  {
    id: 9,
    group: "Today",
    name: "Orlando Diggs",
    subject: "Cargo Marine Insurance Policy #POL-8821-MAR",
    preview: "Institute Cargo Clauses (A) cover note issued for breakbulk machinery shipment.",
    time: "9:12 AM",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Orlando Diggs",
      role: "Marine Insurance Surveyor",
      company: "Asuransi Jasa Indonesia (Jasindo)",
      email: "orlando.diggs@jasindo.co.id",
      phone: "+62 812-7200-5550",
      website: "jasindo.co.id",
      location: "Jakarta, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Insurance Underwriter",
      qualifiedAt: "Dec 1, 2025",
      tags: ["Marine Insurance", "Breakbulk", "Clause A"],
    },
    messages: [
      {
        id: 901,
        side: "in",
        text: "Marine Insurance Policy cover note issued for USD 450,000 breakbulk heavy machinery shipment.",
        time: "9:12 AM",
      },
      {
        id: 902,
        side: "out",
        text: "Understood, Orlando. Does All Risks (Clause A) cover transshipment risks at Singapore Port?",
        time: "9:08 AM",
      },
      {
        id: 903,
        side: "in",
        text: "Yes, full Institute Cargo Clauses (A) including loading/unloading and transshipment.",
        time: "9:04 AM",
      },
      {
        id: 904,
        side: "out",
        text: "Policy document uploaded to ERP One Document Hub.",
        time: "9:00 AM",
      },
    ],
  },
  {
    id: 10,
    group: "Today",
    name: "Andi Lane",
    subject: "INSW Customs Gateway API Rate Limit Bump",
    preview: "Customs EDI throughput increased for PEB & PIB submission pipeline.",
    time: "8:47 AM",
    isUnread: true,
    isOnline: true,
    unreadCount: 3,
    contact: {
      name: "Andi Lane",
      role: "EDI Integration Lead",
      company: "INSW (Indonesia National Single Window)",
      email: "andi.lane@insw.go.id",
      phone: "+62 811-3531-5550",
      website: "insw.go.id",
      location: "Jakarta, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Gov Gateway",
      qualifiedAt: "Apr 19, 2026",
      tags: ["INSW", "Customs EDI", "API Sync"],
    },
    messages: [
      {
        id: 1001,
        side: "in",
        text: "Customs EDI throughput increased to 500 documents/min for peak export hours.",
        time: "8:47 AM",
      },
      {
        id: 1002,
        side: "out",
        text: "Thank you Andi. Our automated PEB submission service is now syncing smoothly.",
        time: "8:43 AM",
      },
      {
        id: 1003,
        side: "in",
        text: "Confirmed. Zero transmission errors reported in the last 2 hours.",
        time: "8:39 AM",
      },
      {
        id: 1004,
        side: "out",
        text: "Awesome, all pending PEB submissions cleared.",
        time: "8:35 AM",
      },
    ],
  },
  {
    id: 11,
    group: "Today",
    name: "Kate Morrison",
    subject: "Urgent Container Seal Discrepancy #SHP-2026-112",
    preview: "Discrepancy detected between physical seal and Shipping Instruction for 2x40ft HC.",
    time: "8:05 AM",
    isUnread: true,
    isOnline: false,
    unreadCount: 6,
    contact: {
      name: "Kate Morrison",
      role: "Container Yard Representative",
      company: "COSCO Shipping Lines",
      email: "kate.morrison@cosco.co.id",
      phone: "+62 813-2135-5501",
      website: "coscoshipping.com",
      location: "Tanjung Priok, Jakarta",
      timezone: "WIB (UTC+7)",
      status: "Carrier Partner",
      qualifiedAt: "Jun 2, 2026",
      tags: ["Urgent", "COSCO", "Seal Issue"],
    },
    messages: [
      {
        id: 1101,
        side: "in",
        text: "Discrepancy on Container COSU-881230 seal. Physical seal says 88102, SI says 88120.",
        time: "8:05 AM",
      },
      {
        id: 1102,
        side: "out",
        text: "Thanks, Kate. Checking with loading supervisor at Tanjung Priok gate right away.",
        time: "8:01 AM",
      },
      {
        id: 1103,
        side: "in",
        text: "Please re-issue revised Shipping Instruction before 17:00 cutoff.",
        time: "7:57 AM",
      },
      {
        id: 1104,
        side: "out",
        text: "Revised SI uploaded to COSCO portal with updated seal number 88102.",
        time: "7:53 AM",
      },
    ],
  },
  {
    id: 12,
    group: "Today",
    name: "Alec Whitten",
    subject: "2,000 MT RBD Palm Olein Export Booking Request",
    preview: "Requesting ocean freight quotation and vessel space for flexibags to Chittagong.",
    time: "7:38 AM",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Alec Whitten",
      role: "Export Commercial Director",
      company: "PT Agro Palm Indonesia",
      email: "alec.whitten@agropalm.co.id",
      phone: "+62 811-9744-4551",
      website: "agropalm.co.id",
      location: "Medan, Sumatera Utara",
      timezone: "WIB (UTC+7)",
      status: "Exporter Client",
      qualifiedAt: "May 28, 2026",
      tags: ["Bulk Liquid", "Flexibag", "Chittagong"],
    },
    messages: [
      {
        id: 1201,
        side: "in",
        text: "We need booking for 2,000 MT RBD Palm Olein in flexibags to Chittagong Port, Bangladesh.",
        time: "7:38 AM",
      },
      {
        id: 1202,
        side: "out",
        text: "Hi Alec. We have space on Samudera Line V.8812 sailing Aug 18 from Belawan.",
        time: "7:34 AM",
      },
      {
        id: 1203,
        side: "in",
        text: "Please send freight quotation including flexibag fitting service at Belawan depot.",
        time: "7:30 AM",
      },
      {
        id: 1204,
        side: "out",
        text: "Quotation sent! USD 42/MT all-in including flexibag fitting and origin THC.",
        time: "7:26 AM",
      },
    ],
  },
  // Yesterday
  {
    id: 17,
    group: "Yesterday",
    name: "Josh Miller",
    subject: "Freight Forwarding Agency Partnership in Singapore & Malaysia",
    preview: "Exploring cross-border freight forwarding agent network expansion.",
    time: "Yesterday",
    isUnread: false,
    isOnline: false,
    unreadCount: 0,
    contact: {
      name: "Josh Miller",
      role: "Regional Network Director",
      company: "Asean Freight Logistics Pte Ltd",
      email: "josh.miller@aseanfreight.sg",
      phone: "+65 6555 0165",
      website: "aseanfreight.sg",
      location: "Singapore Port District",
      timezone: "SGT (UTC+8)",
      status: "Agent Network",
      qualifiedAt: "May 15, 2026",
      tags: ["Agent Network", "Cross-Border", "Transshipment"],
    },
    messages: [
      {
        id: 1701,
        side: "in",
        text: "We want to explore a reciprocal agent agreement for Singapore transshipment and Jakarta distribution.",
        time: "Yesterday",
      },
      {
        id: 1702,
        side: "out",
        text: "Thanks, Josh. That fits our regional forwarding expansion. What volume of monthly FEUs are you projecting?",
        time: "Yesterday",
      },
      {
        id: 1703,
        side: "in",
        text: "Around 40-50 FEU per month, mostly industrial machinery and electronics.",
        time: "Yesterday",
      },
      {
        id: 1704,
        side: "out",
        text: "I'll share our agent handling tariffs and SLA standards for Tanjung Priok.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 18,
    group: "Yesterday",
    name: "Mollie Hall",
    subject: "Customs Audit & Activity Log Export for May 2026",
    preview: "Customs audit team requested electronic submission logs for all export shipments.",
    time: "Yesterday",
    isUnread: false,
    isOnline: true,
    unreadCount: 0,
    contact: {
      name: "Mollie Hall",
      role: "Customs Compliance Auditor",
      company: "Direktorat Jenderal Bea Cukai",
      email: "mollie.hall@beacukai.go.id",
      phone: "+62 821-2055-5017",
      website: "beacukai.go.id",
      location: "Jakarta, Indonesia",
      timezone: "WIB (UTC+7)",
      status: "Regulator",
      qualifiedAt: "Nov 8, 2025",
      tags: ["Customs Audit", "PEB Logs", "Compliance"],
    },
    messages: [
      {
        id: 1801,
        side: "in",
        text: "Our customs compliance audit requires electronic PEB logs for all May 2026 export shipments.",
        time: "Yesterday",
      },
      {
        id: 1802,
        side: "out",
        text: "Hi Bu Mollie. We can export PEB registration numbers, NPE release dates, and HS Code declarations directly from ERP One.",
        time: "Yesterday",
      },
      {
        id: 1803,
        side: "in",
        text: "CSV or Excel format is fine, including timestamps and digital signature IDs.",
        time: "Yesterday",
      },
      {
        id: 1804,
        side: "out",
        text: "Understood. Report generated and securely transmitted via Bea Cukai portal.",
        time: "Yesterday",
      },
    ],
  },
];

export const currentUser = {
  name: "Fadhlur Rahman",
  email: "fdrahman@rexcorp.id",
};
