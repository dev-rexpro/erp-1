import { create } from 'zustand'

interface RexProAiStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggle: () => void
}

export const useRexProAi = create<RexProAiStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
