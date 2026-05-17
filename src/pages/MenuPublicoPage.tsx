import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, Search } from 'lucide-react'
import { obtenerMenu } from '../api/productosApi'
import type { Producto } from '../types/cafesino.types'
import bg from '../assets/cafesino-bg.jpg'
import logo from '../assets/cafesino-logo.png'
import imgWaffle from '../assets/product-waffle.png'
import imgEspresso from '../assets/product-espresso.png'
import imgAmericano from '../assets/product-americano.png'
import imgLatte from '../assets/product-latte.png'

const ESLOGAN = 'Sabor y orden en cada servicio'

/** Duración principal del splash (la salida usa framer-motion y suma ~0,45–0,55 s más) */
const SPLASH_HOLD_MS = 5000

const SPLASH_SPRING_SOFT = { type: 'spring' as const, damping: 26, stiffness: 120 }

const SPLASH_VARIANTS_CONTAINER = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.065, delayChildren: 0.12 },
  },
}

const SPLASH_VARIANTS_CHILD = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: SPLASH_SPRING_SOFT,
  },
}

const SPLASH_VARIANTS_WORD_ROW = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.18 },
  },
}

const SPLASH_VARIANTS_WORD = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: SPLASH_SPRING_SOFT,
  },
}

const SPLASH_VARIANTS_LINE = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
}

function usePrefersReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
}

const FALLBACK_IMAGES: Record<string, string> = {
  P001: imgWaffle,
  P002: imgLatte,
  P003: imgLatte,
  P004: imgAmericano,
  P005: imgEspresso,
  P006: imgEspresso,
}

function getImage(prod: Producto): string {
  if (prod.imagen_url) return prod.imagen_url
  return FALLBACK_IMAGES[prod.prod_id] ?? bg
}

function MenuSkeletonGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 20,
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            height: 296,
            background: 'var(--surface)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            opacity: 0.45,
            animation: 'fadeInUp 0.35s ease both',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

function ProductoCard({ producto, index }: { producto: Producto; index: number }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
        animation: `fadeInUp 0.35s ease ${index * 0.05}s both`,
      }}
    >
      <div
        style={{
          height: 160,
          width: '100%',
          backgroundImage: `url(${getImage(producto)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderRadius: 20,
            padding: '3px 10px',
            background: 'var(--cafe-light)',
            color: 'var(--cafe)',
          }}
        >
          {producto.categoria}
        </span>

        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.35,
            margin: 0,
          }}
        >
          {producto.nombre}
        </h3>

        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid var(--border)',
            paddingTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Precio
          </span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--cafe)' }}>
            ${producto.precio.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MenuPublicoPage() {
  const reduceMotion = usePrefersReducedMotion()
  const [splashVisible, setSplashVisible] = useState(() => !reduceMotion)
  const [splashLogoError, setSplashLogoError] = useState(false)

  const [query, setQuery] = useState('')
  const [catActiva, setCatActiva] = useState('Todos')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['menu-publico'],
    queryFn: obtenerMenu,
    refetchInterval: 30_000,
  })

  const disponibles = data?.disponibles ?? []

  const categorias = useMemo(() => {
    const set = new Set(disponibles.map((p) => p.categoria).filter(Boolean))
    return ['Todos', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))]
  }, [disponibles])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    return disponibles.filter((p) => {
      const porCat = catActiva === 'Todos' || p.categoria === catActiva
      const porNombre = !q || p.nombre.toLowerCase().includes(q)
      return porCat && porNombre
    })
  }, [disponibles, catActiva, query])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setTimeout(() => setSplashVisible(false), SPLASH_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [reduceMotion])

  useEffect(() => {
    if (!splashVisible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [splashVisible])

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="min-h-screen"
        style={{ background: 'rgba(0,0,0,0.68)' }}
        aria-hidden={splashVisible}
      >

        {/* Hero — mismo fondo visible detrás */}
        <header style={{ padding: '40px 24px 24px', textAlign: 'center' }}>
          <p
            style={{
              color: '#C4956A',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.35em',
              marginBottom: 10,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            Bienvenido a
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.25rem, 6vw, 3rem)',
              fontWeight: 700,
              color: '#f8f4ec',
              marginBottom: 8,
            }}
          >
            Cafesino
          </h1>
          <p style={{ color: 'rgba(244,238,229,0.85)', fontSize: 14.5 }}>
            Menú del día
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ height: 1, width: 64, background: 'rgba(196,149,106,0.45)' }} />
            <Coffee size={15} style={{ color: '#C4956A' }} />
            <div style={{ height: 1, width: 64, background: 'rgba(196,149,106,0.45)' }} />
          </div>

          {/* Buscar */}
          <div style={{ maxWidth: 420, margin: '28px auto 0', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.45)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px 12px 42px',
                borderRadius: 10,
                border: '1.5px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: 14.5,
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.42)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
              }}
            />
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>

          {isLoading && (
            <div style={{ paddingTop: 8 }}>
              <MenuSkeletonGrid />
              <p
                style={{
                  textAlign: 'center',
                  marginTop: 20,
                  color: 'rgba(244,238,229,0.85)',
                  fontSize: 14,
                }}
              >
                Preparando el menú…
              </p>
            </div>
          )}

          {isError && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#FDECEA', fontSize: 14 }}>No fue posible cargar el menú.</p>
            </div>
          )}

          {!isLoading && !isError && disponibles.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0', color: 'rgba(244,238,229,0.65)' }}>
              <Coffee size={40} strokeWidth={1.25} />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                No hay productos disponibles en este momento
              </p>
            </div>
          )}

          {!isLoading && !isError && disponibles.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 10,
                  marginBottom: 20,
                  animation: 'fadeInUp 0.35s ease both',
                }}
              >
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatActiva(cat)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 20,
                      border: catActiva === cat ? '1px solid transparent' : '1px solid rgba(255,255,255,0.28)',
                      background: catActiva === cat ? 'var(--cafe)' : 'rgba(255,255,255,0.08)',
                      color: catActiva === cat ? '#fff' : 'rgba(244,238,229,0.85)',
                      fontSize: 13.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <p
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.35em',
                  color: 'rgba(196,149,106,0.85)',
                  marginBottom: 20,
                  fontWeight: 500,
                }}
              >
                {filtrados.length} producto{filtrados.length === 1 ? '' : 's'}
                {(query.trim() || catActiva !== 'Todos') ? ' según filtros' : ' disponibles'}
              </p>

              {filtrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(244,238,229,0.72)', fontSize: 15 }}>
                  No hay coincidencias con tu búsqueda o categoría.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 20,
                  }}
                >
                  {filtrados.map((producto, i) => (
                    <ProductoCard key={producto.prod_id} producto={producto} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AnimatePresence>
        {splashVisible && (
          <motion.div
            role="presentation"
            key="cafesino-splash"
            initial={{ opacity: 1 }}
            exit={reduceMotion
              ? { opacity: 0, transition: { duration: 0.2 } }
              : {
                  opacity: 0,
                  scale: 1.05,
                  filter: 'blur(12px)',
                  transition: { duration: 0.48, ease: [0.32, 0.72, 0, 1] },
                }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              overflow: 'hidden',
            }}
          >
            {/* Fondo conservado · paneo muy suave (Ken Burns ligero), sin segunda capa fija */}
            {!reduceMotion && (
              <motion.div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: '-6%',
                  backgroundImage: `url(${bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1.1, x: '0.8%', y: '-0.5%' }}
                transition={{ duration: 14, ease: [0.25, 0.1, 0.25, 1] }}
              />
            )}

            {!reduceMotion && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  boxShadow: 'inset 0 0 120px rgba(0,0,0,0.45)',
                }}
              />
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.68)',
              }}
            />

            {!reduceMotion && (
              <>
                <motion.div
                  aria-hidden
                  animate={{ opacity: [0.28, 0.45, 0.28], scale: [1, 1.08, 1] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    width: 'min(90vmin, 520px)',
                    height: 'min(90vmin, 520px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 40%, rgba(200,90,18,0.35) 0%, transparent 65%)',
                    filter: 'blur(2px)',
                    pointerEvents: 'none',
                  }}
                />
                <motion.div
                  aria-hidden
                  animate={{ opacity: [0.14, 0.28, 0.14] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{
                    position: 'absolute',
                    width: 'min(70vmin, 360px)',
                    height: 'min(70vmin, 360px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(196,149,106,0.22) 0%, transparent 70%)',
                    top: '12%',
                    right: '-8%',
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}

            <motion.div
              variants={reduceMotion ? undefined : SPLASH_VARIANTS_CONTAINER}
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: 440,
              }}
            >
              <motion.div variants={reduceMotion ? undefined : SPLASH_VARIANTS_CHILD}>
                {!splashLogoError ? (
                  <img
                    src={logo}
                    alt="Cafésino"
                    decoding="async"
                    style={{
                      width: 'min(228px, 58vw)',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      filter: reduceMotion ? undefined : 'drop-shadow(0 12px 36px rgba(0,0,0,0.45))',
                    }}
                    onError={() => setSplashLogoError(true)}
                  />
                ) : (
                  <motion.div
                    animate={reduceMotion ? undefined : { rotate: [-2.4, 2.4, -2.4] }}
                    transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity, repeatType: 'mirror' }}
                    style={{
                      width: 132,
                      height: 132,
                      borderRadius: '50%',
                      background: 'linear-gradient(145deg, var(--cafe) 0%, var(--cafe-dark) 100%)',
                      color: '#fff',
                      fontSize: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 50px rgba(200,90,18,0.35)',
                    }}
                    aria-hidden
                  >
                    ☕
                  </motion.div>
                )}
              </motion.div>

              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  variants={SPLASH_VARIANTS_LINE}
                  style={{
                    marginTop: 18,
                    width: '48%',
                    maxWidth: 160,
                    height: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, transparent, var(--cafe), rgba(196,149,106,0.95), transparent)',
                    transformOrigin: 'center center',
                  }}
                />
              )}

              {!reduceMotion && (
                <motion.div
                  variants={SPLASH_VARIANTS_WORD_ROW}
                  style={{
                    marginTop: 22,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    rowGap: 6,
                    columnGap: '0.35em',
                    maxWidth: '100%',
                  }}
                >
                  {ESLOGAN.split(' ').map((word, idx) => (
                    <motion.span
                      key={idx}
                      variants={SPLASH_VARIANTS_WORD}
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(1.05rem, 3.5vw, 1.35rem)',
                        fontWeight: 600,
                        color: '#f8f4ec',
                        lineHeight: 1.55,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              )}


              {!reduceMotion && (
                <motion.p
                  variants={SPLASH_VARIANTS_CHILD}
                  style={{
                    marginTop: 12,
                    fontSize: 11,
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    color: 'rgba(196,149,106,0.88)',
                    fontWeight: 500,
                  }}
                >
                  Menú en vivo · Actualizado
                </motion.p>
              )}
            </motion.div>

            {!reduceMotion && (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--cafe), #C4956A, rgba(248,244,236,0.8))',
                    transformOrigin: '0% 50%',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SPLASH_HOLD_MS / 1000, ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
