import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../shared/ui';
import Rutas from './Rutas';
import { primeraRutaPermitida, puedeAbrirRuta } from './permisosDashboard';

export function ControlAccesoDashboard({ pathname, children }: { pathname: string; children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const permitido = puedeAbrirRuta(user, pathname);
  useEffect(() => {
    if (permitido) return;
    showToast('Ya no tiene permiso para acceder a este módulo.', 'error');
    void navigate({ to: user ? primeraRutaPermitida(user) : Rutas.login, replace: true });
  }, [permitido, user, navigate, showToast]);

  // Desmonta también detalles y modales: no basta con ocultar el menú.
  return permitido ? children : null;
}
