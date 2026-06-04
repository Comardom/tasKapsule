import gsap from 'gsap'

export type AnimationDirection = 1 | -1

export interface AnimationPlugin {
  leave: (el: Element, done: () => void, dir: AnimationDirection) => void
  enter: (el: Element, done: () => void, dir: AnimationDirection) => void
}

export const slideVertical: AnimationPlugin = {
  leave(el, done, dir) {
    gsap.to(el, {
      opacity: 0,
      y: dir === 1 ? -40 : 40,
      duration: 0.25,
      ease: 'ease-in',
      onComplete: done,
    })
  },
  enter(el, done, dir) {
    gsap.set(el, { opacity: 0, y: dir === 1 ? 40 : -40 })
    const tl = gsap.timeline({ onComplete: done })
    tl.to(el, { opacity: 1, y: 0, duration: 0.25, ease: 'ease-out' })
    const e = el as HTMLElement
    const w = e.closest('.calendar-body-wrapper') as HTMLElement
    if (w) {
      tl.to(w, { blockSize: e.scrollHeight }, 0)
    }
  },
}

export const crossfade: AnimationPlugin = {
  leave(el, done, _dir) {
    gsap.to(el, {
      opacity: 0,
      duration: 0.25,
      ease: 'ease-in',
      onComplete: done,
    })
  },
  enter(el, done, _dir) {
    gsap.set(el, { opacity: 0 })
    const tl = gsap.timeline({ onComplete: done })
    tl.to(el, { opacity: 1, duration: 0.25, ease: 'ease-out' })
    const e = el as HTMLElement
    const w = e.closest('.calendar-body-wrapper') as HTMLElement
    if (w) {
      tl.to(w, { blockSize: e.scrollHeight }, 0)
    }
  },
}

export const animationTypes: Record<string, AnimationPlugin> = {
  'slide-vertical': slideVertical,
  'crossfade': crossfade,
}
