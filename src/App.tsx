import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MenuPublicoPage from './pages/MenuPublicoPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu" element={<MenuPublicoPage />} />

      {/* Rutas Barista */}
      <Route element={<ProtectedRoute rolesPermitidos={['Barista']} />}>
        <Route path="/barista/menu" element={<div className="text-cafe-crema p-8">Barista Menu ? pendiente</div>} />
        <Route path="/barista/ventas" element={<div className="text-cafe-crema p-8">Historial Ventas ? pendiente</div>} />
      </Route>

      {/* Rutas Admin */}
      <Route element={<ProtectedRoute rolesPermitidos={['Administrador']} />}>
        <Route path="/admin/dashboard" element={<div className="text-cafe-crema p-8">Admin Dashboard ? pendiente</div>} />
        <Route path="/admin/ingredientes" element={<div className="text-cafe-crema p-8">Ingredientes ? pendiente</div>} />
        <Route path="/admin/productos" element={<div className="text-cafe-crema p-8">Productos ? pendiente</div>} />
        <Route path="/admin/alertas" element={<div className="text-cafe-crema p-8">Alertas ? pendiente</div>} />
      </Route>

      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
