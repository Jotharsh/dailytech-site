import './style.css'
import Lenis from 'lenis'

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches

/* ───────── smooth scroll ───────── */
let lenis = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 })
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf) }
  requestAnimationFrame(raf)
}
const goTo = (hash) => {
  const el = $(hash); if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: hash === '#top' ? 0 : -10, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); closeSheet(); goTo(a.getAttribute('href')) }))

/* ───────── the nav gets a soft background once the hero is behind us ───────── */
const nav = $('.nav')
const navCheck = () => nav.classList.toggle('solid', scrollY > innerHeight * 0.6)
addEventListener('scroll', navCheck, { passive: true }); navCheck()

/* ───────── menu ───────── */
const burger = $('.burger'), sheet = $('#sheet')
function closeSheet() { burger.setAttribute('aria-expanded', 'false'); sheet.hidden = true; lenis?.start(); document.documentElement.style.overflow = '' }
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true'
  if (open) return closeSheet()
  burger.setAttribute('aria-expanded', 'true'); sheet.hidden = false; lenis?.stop(); document.documentElement.style.overflow = 'hidden'
})
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet() })

/* ───────── the wordmark fills the width ───────── */
const word = $('#word')
function fit() {
  word.style.fontSize = '100px'
  const avail = word.parentElement.clientWidth - parseFloat(getComputedStyle(word.parentElement).paddingInline) * 2
  word.style.fontSize = (100 * avail / word.scrollWidth) + 'px'
}
document.fonts.ready.then(fit); fit(); addEventListener('resize', fit)

/* ───────── the ribbon: capsules on a curve, twisting ───────── */
const ribbon = $('#ribbon')
const IMAGES = ['sitesnap-visit', 'jukeroom-room', 'tapeshot-measure', 'lumabar', 'joinbar-popup', 'sitesnap-report', 'tapeshot-grid', 'jukeroom-second', 'brink-poster']
let tiles = [], W = 0, H = 0, tw = 0, th = 0
function build() {
  const r = ribbon.getBoundingClientRect(); W = r.width; H = r.height
  const small = W < 760
  const N = small ? 16 : 26
  tw = Math.max(40, Math.min(120, W * (small ? 0.1 : 0.07))); th = tw * 2.5
  ribbon.replaceChildren()
  tiles = Array.from({ length: N }, (_, i) => {
    const el = document.createElement('div'); el.className = 'tile'
    el.style.width = tw + 'px'; el.style.height = th + 'px'
    el.style.marginLeft = -tw / 2 + 'px'; el.style.marginTop = -th / 2 + 'px'
    el.style.backgroundImage = `url(media/${IMAGES[i % IMAGES.length]}.jpg)`
    ribbon.append(el); return { el, u: i / (N - 1) }
  })
}
const bez = (a, b, c, d, t) => { const m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d }
const dbez = (a, b, c, d, t) => { const m = 1 - t; return 3 * m * m * (b - a) + 6 * m * t * (c - b) + 3 * t * t * (d - c) }
let mx = 0, my = 0, tx = 0, ty = 0, scrollY0 = 0
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5 })
function frame(ms) {
  const t = ms / 1000
  tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05
  const sy = scrollY
  if (sy > innerHeight * 1.2) return requestAnimationFrame(frame)       // off screen: skip the work
  const small = W < 760
  const P = small
    ? [[-0.1 * W, 0.08 * H], [0.3 * W, 0.5 * H], [0.7 * W, 0.0 * H], [1.1 * W, 0.46 * H]]
    : [[-0.06 * W, 0.2 * H], [0.28 * W, 0.7 * H], [0.6 * W, 0.08 * H], [1.04 * W, 0.62 * H]]
  for (const tile of tiles) {
    const u = tile.u
    const x = bez(P[0][0], P[1][0], P[2][0], P[3][0], u), y = bez(P[0][1], P[1][1], P[2][1], P[3][1], u)
    const dx = dbez(P[0][0], P[1][0], P[2][0], P[3][0], u), dy = dbez(P[0][1], P[1][1], P[2][1], P[3][1], u)
    const ang = Math.atan2(dy, dx) * 180 / Math.PI
    const phase = u * Math.PI * 6.2 + (reduce ? 0 : t * 0.55) + sy * 0.0035
    const c = Math.cos(phase)
    const sx = 0.2 + 0.8 * Math.abs(c) , grow = 0.78 + 0.5 * u
    tile.el.style.transform = `translate(${x - tx * 26 * (0.4 + u)}px, ${y - ty * 18 * (0.4 + u) - sy * 0.08}px) rotate(${ang}deg) scale(${sx * grow}, ${grow})`
    tile.el.style.zIndex = Math.round(Math.sin(phase * 0.9) * 20) + 30
  }
  requestAnimationFrame(frame)
}
build(); requestAnimationFrame(frame)
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150) })

/* ───────── reveal on scroll ───────── */
const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
$$('[data-r]').forEach((el, i) => { el.style.transitionDelay = (el.parentElement.matches('.figs, .days') ? [...el.parentElement.children].indexOf(el) * 90 : 0) + 'ms'; io.observe(el) })

/* ───────── counters ───────── */
const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return; cio.unobserve(e.target)
  const to = Number(e.target.dataset.count); if (reduce || !to) return
  const t0 = performance.now()
  const tick = (now) => { const p = Math.min(1, (now - t0) / 1400); e.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick) }
  e.target.textContent = '0'; requestAnimationFrame(tick)
}), { threshold: 0.4 })
$$('[data-count]').forEach((el) => cio.observe(el))

/* ───────── the builds list ───────── */
const rows = $$('.row')
rows.forEach((row) => {
  const btn = $('.row-h', row)
  btn.addEventListener('click', () => {
    const open = !row.classList.contains('open')
    rows.forEach((r) => { r.classList.remove('open'); $('.row-h', r).setAttribute('aria-expanded', 'false') })
    if (open) { row.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); setTimeout(() => lenis?.resize?.(), 900) }
  })
})
// a small picture that follows the pointer over a closed row
const peek = $('#peek'), peekImg = $('img', peek)
let px = 0, py = 0, qx = 0, qy = 0, hover = null
if (fine && !reduce) {
  rows.forEach((row) => {
    const btn = $('.row-h', row)
    btn.addEventListener('pointerenter', () => { if (row.classList.contains('open')) return; peekImg.src = row.dataset.img; peek.classList.add('on'); hover = row })
    btn.addEventListener('pointerleave', () => { peek.classList.remove('on'); hover = null })
    btn.addEventListener('click', () => peek.classList.remove('on'))
  })
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY })
  const move = () => { qx += (px - qx) * 0.14; qy += (py - qy) * 0.14; peek.style.transform = `translate(${qx + 28}px, ${qy - 140}px) rotate(${(px - qx) * 0.05}deg)`; requestAnimationFrame(move) }
  move()
}

/* ───────── the reel plays only while visible ───────── */
const v = $('#reelv')
new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.35 }).observe(v)
