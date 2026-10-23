import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const isWide = () => matchMedia('(min-width: 1000px)').matches
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const clamp = (n, a, b) => Math.min(b, Math.max(a, n))

/* ───────── smooth scroll ───────── */
let lenis = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y }))

// plain in-page links glide to their section
$$('a[href^="#"]').forEach((a) => {
  if (a.dataset.go !== undefined) return                  // the project index has its own mapping
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    const target = id === '#top' ? document.body : $(id)
    if (!target) return
    e.preventDefault()
    scrollToY(id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY)
  })
})

/* ───────── first screen: the masked headline, then the rest ───────── */
if (!reduce) {
  gsap.set('.hero h1 .in', { yPercent: 112 })
  gsap.set('[data-hero-fade]', { opacity: 0, y: 22 })
  gsap.set('.top', { opacity: 0 })
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .to('.hero h1 .in', { yPercent: 0, duration: 1.05, stagger: 0.11 })
    .to('.top', { opacity: 1, duration: 0.9 }, '<0.25')
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 }, '-=0.55')
}

/* ───────── the parts of each section arrive one after another ───────── */
if (!reduce) {
  const reveal = (sel) => {
    gsap.set(sel, { opacity: 0, y: 30 })
    ScrollTrigger.batch(sel, {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.95, stagger: 0.1, ease: 'expo.out', overwrite: true }),
    })
  }
  reveal('[data-reveal]')
  if (!isWide()) reveal('[data-reveal-mobile]')

  // the figures count up
  $$('.num[data-count]').forEach((el) => {
    const end = Number(el.dataset.count), start = end === 0 ? 9 : 0, o = { v: start }
    el.textContent = String(start)
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', snap: { v: 1 }, onUpdate: () => (el.textContent = String(o.v)) }),
    })
  })

  // the stages of a day draw in from the left
  const segs = $$('.seg')
  gsap.set(segs.map((s) => $('.dur', s)), { clipPath: 'inset(0 100% 0 0)' })
  gsap.set(segs.map((s) => $('p', s)), { opacity: 0, y: 14 })
  ScrollTrigger.create({
    trigger: '.bar', start: 'top 82%', once: true,
    onEnter: () => {
      gsap.to(segs.map((s) => $('.dur', s)), { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.out', stagger: 0.14 })
      gsap.to(segs.map((s) => $('p', s)), { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.14, delay: 0.45 })
    },
  })
}

// the highlighted words in the story are marked one by one
ScrollTrigger.batch('mark', {
  start: 'top 88%', once: true,
  onEnter: (els) => els.forEach((m, i) => setTimeout(() => m.classList.add('on'), reduce ? 0 : i * 160)),
})
if (reduce) $$('mark').forEach((m) => m.classList.add('on'))

/* ───────── the work: one project per screen of scrolling ───────── */
const work = $('.work')
const projects = $$('.project')
const pics = projects.map((p) => $('.pic', p))
const links = $$('.index a')
const video = $('video')
let current = -1

function setActive(i) {
  if (i === current) return
  current = i
  projects.forEach((p, k) => {
    p.classList.toggle('is-active', k === i)
    const info = $('.info', p)
    info.toggleAttribute('inert', k !== i)
    pics[k].classList.toggle('is-on', k <= i)
  })
  links.forEach((a, k) => a.setAttribute('aria-current', String(k === i)))
  if (video) (i === 2 ? video.play().catch(() => {}) : video.pause())
}
function clearPinned() {
  current = -1
  projects.forEach((p, k) => { p.classList.remove('is-active'); $('.info', p).removeAttribute('inert'); pics[k].classList.remove('is-on') })
}
const progress = () => {
  const r = work.getBoundingClientRect()
  return clamp(-r.top / (r.height - innerHeight), 0, 1)
}
ScrollTrigger.create({
  trigger: work, start: 'top 70%', end: 'bottom bottom',
  onUpdate: () => { if (isWide()) setActive(Math.round(progress() * (projects.length - 1))) },
  onLeaveBack: () => { if (isWide()) { clearPinned() } },
})
addEventListener('resize', () => { if (!isWide()) { clearPinned(); if (video) video.pause() } else if (current === -1) setActive(Math.round(progress() * (projects.length - 1))) })

links.forEach((a, k) => a.addEventListener('click', (e) => {
  e.preventDefault()
  const top = work.getBoundingClientRect().top + scrollY
  scrollToY(top + (k / (projects.length - 1)) * (work.offsetHeight - innerHeight))
}))
// keyboard: arrow keys move through the index
$('.index')?.addEventListener('keydown', (e) => {
  if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return
  const k = clamp(links.indexOf(document.activeElement) + (e.key === 'ArrowDown' ? 1 : -1), 0, links.length - 1)
  links[k].focus(); e.preventDefault()
})

// on a phone the clip plays only while it is on screen
if (video) new IntersectionObserver(([e]) => { if (!isWide()) (e.isIntersecting ? video.play().catch(() => {}) : video.pause()) }, { threshold: 0.4 }).observe(video)

document.fonts.ready.then(() => ScrollTrigger.refresh())
