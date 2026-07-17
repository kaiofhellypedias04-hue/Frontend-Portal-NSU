import { Database, HardDrive, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { API_BASE_URL, STATUS_REFRESH_MS } from '../lib/api';
import { useHealth } from '../hooks/useHealth';
import { PageHeader } from '../components/ui/PageHeader';

export function Configuracoes() {
  const { apiHealth, dbHealth, storageHealth } = useHealth();

  return (
    <div>
      <PageHeader eyebrow="Ambiente" title="Configurações" description="Consulte a conexão com a API, banco de dados e armazenamento do portal." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <Server className="mb-4 text-sky-300" size={24} />
          <div className="flex items-center justify-between"><p className="text-sm text-textSoft">API</p><Badge value={apiHealth.isSuccess ? 'ok' : 'offline'} /></div>
          <p className="mt-2 break-all font-semibold text-white">{API_BASE_URL}</p>
          <p className="mt-3 text-xs text-textSoft">Status refresh: {STATUS_REFRESH_MS} ms</p>
          <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-accent">Ver detalhes técnicos</summary><pre className="mt-2 overflow-auto rounded-xl bg-slate-950/50 p-3 text-xs text-textSoft">{JSON.stringify(apiHealth.data || apiHealth.error?.message || {}, null, 2)}</pre></details>
        </Card>
        <Card>
          <Database className="mb-4 text-emerald-300" size={24} />
          <div className="flex items-center justify-between"><p className="text-sm text-textSoft">Banco</p><Badge value={dbHealth.isSuccess ? 'ok' : 'offline'} /></div>
          <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-accent">Ver detalhes técnicos</summary><pre className="mt-2 overflow-auto rounded-xl bg-slate-950/50 p-3 text-xs text-textSoft">{JSON.stringify(dbHealth.data || dbHealth.error?.message || {}, null, 2)}</pre></details>
        </Card>
        <Card>
          <HardDrive className="mb-4 text-amber-300" size={24} />
          <div className="flex items-center justify-between"><p className="text-sm text-textSoft">Storage</p><Badge value={storageHealth.isSuccess ? 'ok' : 'offline'} /></div>
          <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-accent">Ver detalhes técnicos</summary><pre className="mt-2 overflow-auto rounded-xl bg-slate-950/50 p-3 text-xs text-textSoft">{JSON.stringify(storageHealth.data || storageHealth.error?.message || {}, null, 2)}</pre></details>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="font-bold text-white">Endpoints usados pelo painel</h2>
        <p className="mt-2 text-sm text-textSoft">O status ao vivo usa uma base única configurada por VITE_API_BASE_URL.</p>
        <pre className="mt-4 overflow-auto rounded-xl bg-slate-950/50 p-4 text-sm text-slate-300">GET /consultas/status{`\n`}POST /consultas/iniciar{`\n`}POST /consultas/desativar</pre>
      </Card>
    </div>
  );
}
