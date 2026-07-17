export const pageLoaders = {
  dashboard: () => import('../pages/Dashboard'), conferencia: () => import('../pages/Conferencia'), certificados: () => import('../pages/Certificados'),
  notas: () => import('../pages/NotasConsultadas'), fila: () => import('../pages/Fila'), processos: () => import('../pages/Processos'),
  configuracoes: () => import('../pages/Configuracoes'), motorAdn: () => import('../pages/MotorAdn'),
};

export function prefetchRoute(path: string) {
  if (path.startsWith('/conferencia')) return void pageLoaders.conferencia();
  if (path.startsWith('/motor-adn')) return void pageLoaders.motorAdn();
  if (path.startsWith('/certificados')) return void pageLoaders.certificados();
  if (path.startsWith('/notas')) return void pageLoaders.notas();
  if (path.startsWith('/fila')) return void pageLoaders.fila();
  if (path.startsWith('/processos')) return void pageLoaders.processos();
  if (path.startsWith('/configuracoes')) return void pageLoaders.configuracoes();
  return void pageLoaders.dashboard();
}
