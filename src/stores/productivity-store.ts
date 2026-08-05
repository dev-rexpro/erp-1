import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProductivityUser {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

export interface ProductivityNote {
  id: string
  userId: string
  title: string
  content: string
  category: 'Work' | 'Personal' | 'Meeting' | 'Export/Import' | 'Ideas'
  isPinned?: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductivityTask {
  id: string
  userId: string
  title: string
  tag: 'Work' | 'Design' | 'Admin' | 'Content' | 'Planning' | 'Freight' | 'Customs'
  time: string
  dateBucket: 'today' | 'tomorrow' | 'this-week'
  checked: boolean
  priority?: 'Low' | 'Medium' | 'High'
  createdAt: string
}

export interface ProductivityProject {
  id: string
  userId: string
  title: string
  status: 'In Progress' | 'Planning' | 'Completed'
  description: string
  progress: number
  dueDate: string
  iconName?: string
  createdAt: string
}

export const INITIAL_USERS: ProductivityUser[] = [
  {
    id: 'usr_1',
    name: 'Fadhlur Rahman',
    email: 'fdrahman@rexcorp.id',
    role: 'Lead Freight Architect',
    avatar: '/avatars/01.png',
  },
  {
    id: 'usr_2',
    name: 'Sarah Jenkins',
    email: 'sjenkins@rexcorp.id',
    role: 'Customs Compliance Officer',
    avatar: '/avatars/02.png',
  },
  {
    id: 'usr_3',
    name: 'Ahmad Fauzi',
    email: 'afauzi@rexcorp.id',
    role: 'Export Logistics Coordinator',
    avatar: '/avatars/03.png',
  },
]

const INITIAL_NOTES: ProductivityNote[] = [
  // User 1 - Fadhlur Rahman
  {
    id: 'note_1',
    userId: 'usr_1',
    title: 'Shipping Line Rate Negotiation Strategy Q3',
    content: 'Review contract terms with Maersk & MSC. Aim for 14-day free demurrage extension at Tanjung Priok and Tanjung Perak ports.',
    category: 'Work',
    isPinned: true,
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'note_2',
    userId: 'usr_1',
    title: 'Tg. Priok Port Congestion Contingency Plan',
    content: 'Identify alternative berthing windows and feeder routes via Singapore during peak August export volumes.',
    category: 'Export/Import',
    isPinned: false,
    createdAt: '2026-07-31T14:20:00.000Z',
    updatedAt: '2026-07-31T14:20:00.000Z',
  },
  {
    id: 'note_3',
    userId: 'usr_1',
    title: 'Ideas for Automated BL Generation Workflow',
    content: 'Integrate OCR scanning for packing lists to auto-populate Bill of Lading drafts directly in ERP One.',
    category: 'Ideas',
    isPinned: false,
    createdAt: '2026-07-28T11:00:00.000Z',
    updatedAt: '2026-07-28T11:00:00.000Z',
  },

  // User 2 - Sarah Jenkins
  {
    id: 'note_4',
    userId: 'usr_2',
    title: 'Customs Jalur Merah Audit Checklist',
    content: 'Required documents: Commercial Invoice, Packing List, Certificate of Origin Form E, B/L copy, and PIB declaration draft.',
    category: 'Work',
    isPinned: true,
    createdAt: '2026-08-01T10:15:00.000Z',
    updatedAt: '2026-08-01T10:15:00.000Z',
  },
  {
    id: 'note_5',
    userId: 'usr_2',
    title: 'HS Code Tariff Updates - Electronics Category',
    content: 'Verify import duty rate for HS 8471.30.20 laptop shipments entering Tanjung Priok.',
    category: 'Export/Import',
    isPinned: false,
    createdAt: '2026-07-30T16:45:00.000Z',
    updatedAt: '2026-07-30T16:45:00.000Z',
  },

  // User 3 - Ahmad Fauzi
  {
    id: 'note_6',
    userId: 'usr_3',
    title: 'Air Freight Booking Allocation Rules',
    content: 'Priority space allocation on Lufthansa Cargo flights for high-value tech cargo departing CGK.',
    category: 'Work',
    isPinned: true,
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
  },
]

const INITIAL_TASKS: ProductivityTask[] = [
  // User 1 - Fadhlur Rahman
  {
    id: 'task_1',
    userId: 'usr_1',
    title: 'Finalize Q2 Ocean Freight Roadmap',
    tag: 'Freight',
    time: '10:00 AM',
    dateBucket: 'today',
    checked: false,
    priority: 'High',
    createdAt: '2026-08-02T01:00:00.000Z',
  },
  {
    id: 'task_2',
    userId: 'usr_1',
    title: 'Review Maersk Line SLA contract updates',
    tag: 'Admin',
    time: '11:30 AM',
    dateBucket: 'today',
    checked: true,
    priority: 'Medium',
    createdAt: '2026-08-02T01:30:00.000Z',
  },
  {
    id: 'task_3',
    userId: 'usr_1',
    title: 'Prepare freight yield presentation for C-Suite',
    tag: 'Work',
    time: '02:00 PM',
    dateBucket: 'today',
    checked: false,
    priority: 'High',
    createdAt: '2026-08-02T02:00:00.000Z',
  },
  {
    id: 'task_4',
    userId: 'usr_1',
    title: 'Audit demurrage variance logs for MSC vessels',
    tag: 'Planning',
    time: '04:30 PM',
    dateBucket: 'today',
    checked: false,
    priority: 'Medium',
    createdAt: '2026-08-02T02:30:00.000Z',
  },

  // User 2 - Sarah Jenkins
  {
    id: 'task_5',
    userId: 'usr_2',
    title: 'Review PIB Customs Clearance for PT Samudera Export',
    tag: 'Customs',
    time: '09:00 AM',
    dateBucket: 'today',
    checked: true,
    priority: 'High',
    createdAt: '2026-08-02T01:00:00.000Z',
  },
  {
    id: 'task_6',
    userId: 'usr_2',
    title: 'Verify Certificate of Origin Form E for Global Trading',
    tag: 'Customs',
    time: '11:00 AM',
    dateBucket: 'today',
    checked: false,
    priority: 'Medium',
    createdAt: '2026-08-02T01:30:00.000Z',
  },
  {
    id: 'task_7',
    userId: 'usr_2',
    title: 'Submit monthly compliance report to Bea Cukai',
    tag: 'Admin',
    time: '03:00 PM',
    dateBucket: 'today',
    checked: false,
    priority: 'High',
    createdAt: '2026-08-02T02:00:00.000Z',
  },

  // User 3 - Ahmad Fauzi
  {
    id: 'task_8',
    userId: 'usr_3',
    title: 'Coordinate container truck dispatch at Tanjung Perak',
    tag: 'Freight',
    time: '08:30 AM',
    dateBucket: 'today',
    checked: true,
    priority: 'High',
    createdAt: '2026-08-02T00:30:00.000Z',
  },
  {
    id: 'task_9',
    userId: 'usr_3',
    title: 'Confirm space booking with Ocean Line Logistics',
    tag: 'Work',
    time: '10:30 AM',
    dateBucket: 'today',
    checked: false,
    priority: 'Medium',
    createdAt: '2026-08-02T01:00:00.000Z',
  },
]

const INITIAL_PROJECTS: ProductivityProject[] = [
  // User 1 - Fadhlur Rahman
  {
    id: 'proj_1',
    userId: 'usr_1',
    title: 'Q2 Freight Yield Optimization',
    status: 'In Progress',
    description: 'Increase net yield per TEU across Singapore & Europe routes.',
    progress: 68,
    dueDate: 'Aug 15',
    iconName: 'Orbit',
    createdAt: '2026-07-15T00:00:00.000Z',
  },
  {
    id: 'proj_2',
    userId: 'usr_1',
    title: 'Automated Document OCR Pipeline',
    status: 'Planning',
    description: 'AI extraction for Bills of Lading and Packing Lists.',
    progress: 42,
    dueDate: 'Aug 28',
    iconName: 'Globe',
    createdAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'proj_3',
    userId: 'usr_1',
    title: 'Client SLA Onboarding Portal',
    status: 'Planning',
    description: 'Self-service portal for enterprise shippers.',
    progress: 31,
    dueDate: 'Sep 05',
    iconName: 'ClipboardCheck',
    createdAt: '2026-07-25T00:00:00.000Z',
  },

  // User 2 - Sarah Jenkins
  {
    id: 'proj_4',
    userId: 'usr_2',
    title: 'Customs Compliance Automation',
    status: 'In Progress',
    description: 'Automated HS Code classification and quota risk checks.',
    progress: 80,
    dueDate: 'Aug 10',
    iconName: 'ClipboardCheck',
    createdAt: '2026-07-10T00:00:00.000Z',
  },
  {
    id: 'proj_5',
    userId: 'usr_2',
    title: 'Green Line Clearance Speedup',
    status: 'Planning',
    description: 'Targeting 90% Jalur Hijau auto-release rate.',
    progress: 55,
    dueDate: 'Aug 22',
    iconName: 'Globe',
    createdAt: '2026-07-18T00:00:00.000Z',
  },

  // User 3 - Ahmad Fauzi
  {
    id: 'proj_6',
    userId: 'usr_3',
    title: 'Fleet Dispatch Modernization',
    status: 'In Progress',
    description: 'Real-time GPS tracking for port container trucks.',
    progress: 72,
    dueDate: 'Aug 18',
    iconName: 'Orbit',
    createdAt: '2026-07-12T00:00:00.000Z',
  },
]

interface ProductivityStoreState {
  users: ProductivityUser[]
  activeUserId: string
  notes: ProductivityNote[]
  tasks: ProductivityTask[]
  projects: ProductivityProject[]

  // User switching
  setActiveUserId: (userId: string) => void

  // Notes actions
  addNote: (note: Omit<ProductivityNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<ProductivityNote>) => void
  deleteNote: (id: string) => void
  togglePinNote: (id: string) => void

  // Tasks actions
  addTask: (task: Omit<ProductivityTask, 'id' | 'createdAt'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  // Projects actions
  addProject: (project: Omit<ProductivityProject, 'id' | 'createdAt'>) => void
  updateProjectProgress: (id: string, progress: number) => void
  deleteProject: (id: string) => void

  // Reset demo data
  resetProductivityData: () => void
}

export const useProductivityStore = create<ProductivityStoreState>()(
  persist(
    (set) => ({
      users: INITIAL_USERS,
      activeUserId: 'usr_1',
      notes: INITIAL_NOTES,
      tasks: INITIAL_TASKS,
      projects: INITIAL_PROJECTS,

      setActiveUserId: (userId) => set({ activeUserId: userId }),

      // Notes
      addNote: (newNoteData) =>
        set((state) => {
          const now = new Date().toISOString()
          const newNote: ProductivityNote = {
            ...newNoteData,
            id: `note_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
          }
          return { notes: [newNote, ...state.notes] }
        }),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      togglePinNote: (id) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
        })),

      // Tasks
      addTask: (newTaskData) =>
        set((state) => {
          const newTask: ProductivityTask = {
            ...newTaskData,
            id: `task_${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          return { tasks: [newTask, ...state.tasks] }
        }),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Projects
      addProject: (newProjData) =>
        set((state) => {
          const newProject: ProductivityProject = {
            ...newProjData,
            id: `proj_${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          return { projects: [newProject, ...state.projects] }
        }),

      updateProjectProgress: (id, progress) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, progress } : p)),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      resetProductivityData: () =>
        set({
          users: INITIAL_USERS,
          activeUserId: 'usr_1',
          notes: INITIAL_NOTES,
          tasks: INITIAL_TASKS,
          projects: INITIAL_PROJECTS,
        }),
    }),
    {
      name: 'erp-productivity-store',
    }
  )
)
