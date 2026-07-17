import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { pageLoaders } from './page-loaders';

const Dashboard = lazy(() => pageLoaders.dashboard().then((m) => ({ default: m.Dashboard })));
const Conferencia = lazy(() => pageLoaders.conferencia().then((m) => ({ default: m.Conferencia })));
const Certificados = lazy(() => pageLoaders.certificados().then((m) => ({ default: m.Certificados })));
const NotasConsultadas = lazy(() => pageLoaders.notas().then((m) => ({ default: m.NotasConsultadas })));
const Fila = lazy(() => pageLoaders.fila().then((m) => ({ default: m.Fila })));
const Processos = lazy(() => pageLoaders.processos().then((m) => ({ default: m.Processos })));
const Configuracoes = lazy(() => pageLoaders.configuracoes().then((m) => ({ default: m.Configuracoes })));
const MotorAdn = lazy(() => pageLoaders.motorAdn().then((m) => ({ default: m.MotorAdn })));

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
