import { useQuery } from '@tanstack/react-query'
import { Coffee } from 'lucide-react'
import { obtenerMenu } from '../api/productosApi'
import type { Producto } from '../types/cafesino.types'
import bg from '../assets/cafesino-bg.jpg'
import imgWaffle from '../assets/product-waffle.png'
import imgEspresso from '../assets/product-espresso.png'
import imgAmericano from '../assets/product-americano.png'
import imgLatte from '../assets/product-latte.png'

const PRODUCT_IMAGES: Record<string, string> = {
  P001: imgWaffle,
  P002: imgLatte,
  P003: imgLatte,
  P004: imgAmericano,
  P005: imgEspresso,
  P006: imgEspresso,
}

function getImage(prod_id: string): string {
  return PRODUCT_IMAGES[prod_id] ?? bg
}

function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(20, 12, 6, 0.82)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(196,149,106,0.30)',
      }}
    >
      {/* Imagen especifica del producto */}
      <div
        className="h-40 w-full"
        style={{
          backgroundImage: `url(${getImage(producto.prod_id)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Badge categoria */}
        <span
          className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start"
          style={{ background: 'rgba(196,149,106,0.20)', color: '#C4956A' }}
        >
          {producto.categoria}
        </span>

        {/* Nombre */}
        <h3
          className="text-cafe-crema text-xl font-bold leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div className="border-t border-cafe-latte/20 mt-auto pt-3 flex items-center justify-between">
          <span
            className="text-cafe-latte/70 text-xs uppercase tracking-wider"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Precio
          </span>
          <span
            className="text-2xl font-extrabold"
            style={{ color: '#C4956A', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ${producto.precio.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MenuPublicoPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['menu-publico'],
    queryFn: obtenerMenu,
    refetchInterval: 30_000,
  })

  const disponibles = data?.disponibles ?? []

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
      <div className="min-h-screen" style={{ background: 'rgba(0,0,0,0.68)' }}>

        <header className="pt-12 pb-8 px-6 text-center">
          <p
            className="text-cafe-latte text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: '0.35em' }}
          >
            Bienvenido a
          </p>
          <h1
            className="text-cafe-crema text-5xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Cafesino
          </h1>
          <p className="text-cafe-latte/80 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
            Nuestro menu del dia
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-cafe-latte/40" />
            <Coffee size={15} className="text-cafe-latte" />
            <div className="h-px w-16 bg-cafe-latte/40" />
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 pb-16">

          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-20 text-cafe-latte">
              <Coffee size={32} className="animate-pulse" />
              <p style={{ fontFamily: "'Lato', sans-serif" }}>Preparando el menu...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-20">
              <p className="text-alerta-critica text-sm">No fue posible cargar el menu.</p>
            </div>
          )}

          {!isLoading && !isError && disponibles.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-cafe-latte/60">
              <Coffee size={40} />
              <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                No hay productos disponibles en este momento
              </p>
            </div>
          )}

          {disponibles.length > 0 && (
            <>
              <h2
                className="text-cafe-latte/70 text-xs uppercase tracking-widest text-center mb-7"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                Productos disponibles
              </h2>
              <div className="flex flex-wrap justify-center gap-5">
                {disponibles.map((producto) => (
                  <div key={producto.prod_id} className="w-full sm:w-72">
                    <ProductoCard producto={producto} />
                  </div>
                ))}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
