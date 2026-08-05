import { useState, useEffect } from 'react'

export function useVisibleCenterPosition(
  parentRef: React.RefObject<HTMLElement | null>,
  {
    height,
    maxScale,
    padding = 16,
    width,
  }: {
    height: number
    maxScale: number
    padding?: number
    width: number
  },
) {
  const [layout, setLayout] = useState<{ scale: number; top: number }>({
    scale: maxScale,
    top: padding,
  })

  useEffect(() => {
    function updateLayout() {
      const parent = parentRef.current
      const parentWidth = parent?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth / 2 : width)
      const parentHeight = parent?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : height)

      let visibleCenter = parentHeight / 2
      if (parent) {
        const parentRect = parent.getBoundingClientRect()
        const visibleTop = Math.max(parentRect.top, 0)
        const visibleBottom = Math.min(parentRect.bottom, window.innerHeight)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        if (visibleHeight > 0) {
          visibleCenter = visibleTop + visibleHeight / 2 - parentRect.top
        }
      }

      const availableWidth = Math.max(0, parentWidth - padding * 2)
      const availableHeight = Math.max(0, parentHeight - padding * 2)
      const rawScale = Math.min(maxScale, availableWidth / width, availableHeight / height)
      const nextScale = Number.isFinite(rawScale) && rawScale > 0 ? Math.max(0.1, rawScale) : maxScale
      const scaledHeight = height * nextScale
      const maxTop = Math.max(padding, parentHeight - scaledHeight - padding)
      const nextTop = Math.min(Math.max(visibleCenter - scaledHeight / 2, padding), maxTop)

      setLayout((currentLayout) => {
        if (currentLayout && currentLayout.top === nextTop && currentLayout.scale === nextScale) {
          return currentLayout
        }
        return { scale: nextScale, top: nextTop }
      })
    }

    updateLayout()
    const rafId = requestAnimationFrame(updateLayout)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && parentRef.current) {
      resizeObserver = new ResizeObserver(() => updateLayout())
      resizeObserver.observe(parentRef.current)
    }

    const intervalId = setInterval(updateLayout, 150)
    const timeoutId = setTimeout(() => clearInterval(intervalId), 1500)

    window.addEventListener('scroll', updateLayout, { passive: true })
    window.addEventListener('resize', updateLayout)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(intervalId)
      clearTimeout(timeoutId)
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('scroll', updateLayout)
      window.removeEventListener('resize', updateLayout)
    }
  }, [height, maxScale, padding, parentRef, width])

  return layout
}

