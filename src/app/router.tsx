import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { Conferencia } from '../pages/Conferencia';
import { Certificados } from '../pages/Certificados';
import { NotasConsultadas } from '../pages/NotasConsultadas';
import { Fila } from '../pages/Fila';
import { Processos } from '../pages/Processos';
import { Configuracoes } from '../pages/Configuracoes';
import { MotorAdn } from '../pages/MotorAdn';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'conferencia', element: <Navigate to="/conferencia/tomados" replace /> },
      {
        path: 'conferencia/tomados',
        element: <Conferencia tipoNotaFixo="tomada" titulo="Conferência S/Tomados" descricao="Notas de serviços tomados/recebidos pela empresa." />,
      },
      {
        path: 'conferencia/prestados',
        element: <Conferencia tipoNotaFixo="prestada" titulo="Conferência S/Prestados" descricao="Notas de serviços prestados/emitidos pela empresa." />,
      },
      { path: 'motor-adn', element: <MotorAdn /> },
      { path: 'empresas', element: <Navigate to="/certificados" replace /> },
      { path: 'certificados', element: <Certificados /> },
      { path: 'notas', element: <NotasConsultadas /> },
      { path: 'nfse', element: <NotasConsultadas /> },
      { path: 'fila', element: <Fila /> },
      { path: 'processos', element: <Processos /> },
      { path: 'configuracoes', element: <Configuracoes /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
