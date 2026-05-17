import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute }         from './components/layout/ProtectedRoute'
import { AdminLayout }            from './components/layout/AdminLayout'
import { BaristaLayout }          from './components/layout/BaristaLayout'
import LoginPage                  from './pages/LoginPage'
import MenuPublicoPage            from './pages/MenuPublicoPage'
import AdminDashboardPage         from './pages/admin/AdminDashboardPage'
import IngredientesPage           from './pages/admin/IngredientesPage'
import ProductosPage              from './pages/admin/ProductosPage'
import AlertasPage                from './pages/admin/AlertasPage'
import RecetasPage                from './pages/admin/RecetasPage'
import UsuariosPage               from './pages/admin/UsuariosPage'
import AdminVentasPage            from './pages/admin/AdminVentasPage'
import BaristaDashboardPage       from './pages/barista/BaristaDashboardPage'
import BaristaVentasPage          from './pages/barista/BaristaVentasPage'
import BaristaMenuPage            from './pages/barista/BaristaMenuPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu"  element={<MenuPublicoPage />} />

      <Route element={<ProtectedRoute rolesPermitidos={['Barista']} />}>
        <Route element={<BaristaLayout />}>
          <Route path="/barista/dashboard" element={<BaristaDashboardPage />} />
          <Route path="/barista/ventas"    element={<BaristaVentasPage />} />
          <Route path="/barista/menu"      element={<BaristaMenuPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute rolesPermitidos={['Administrador']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard"    element={<AdminDashboardPage />} />
          <Route path="/admin/ingredientes" element={<IngredientesPage />} />
          <Route path="/admin/productos"    element={<ProductosPage />} />
          <Route path="/admin/alertas"      element={<AlertasPage />} />
          <Route path="/admin/recetas"      element={<RecetasPage />} />
          <Route path="/admin/usuarios"     element={<UsuariosPage />} />
          <Route path="/admin/ventas"       element={<AdminVentasPage />} />
        </Route>
      </Route>

      <Route path="/"  element={<Navigate to="/menu"  replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
