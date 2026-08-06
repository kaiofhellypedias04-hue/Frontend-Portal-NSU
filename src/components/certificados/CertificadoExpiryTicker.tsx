import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Certificado } from '../../types/api';

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const WARNING_DAYS = 5;
const TICKER_DURATION_MS = 34_000;

function expiryMessage(certificado: Certificado, now: Date) {
  if (!certificado.valido_ate) return null;
  const expiresAt = new Date(certificado.valido_ate);
  if (Number.isNaN(expiresAt.getTime())) return null;

  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expiryUtc = Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth(), expiresAt.getUTCDate());
  const days = Math.ceil((expiryUtc - todayUtc) / 86_400_000);

  if (days < 0) return `Certificado ${certificado.nome} vencido, por favor atualizar.`;
  if (days <= WARNING_DAYS) {
    const unit = days === 1 ? 'dia' : 'dias';
    return `Certificado ${certificado.nome} vai vencer em ${days} ${unit}, por favor atualizar.`;
  }
  return null;
}

export function CertificadoExpiryTicker() {
  const [messages, setMessages] = useState<string[]>([]);
  const [runId, setRunId] = useState(0);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function checkCertificates() {
      try {
        const certificados = await api.listarCertificados({ ativo: true });
        if (!active) return;
        const next = certificados.map((item) => expiryMessage(item, new Date())).filter((item): item is string => Boolean(item));
        if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
        setMessages(next);
        if (next.length) {
          setRunId((value) => value + 1);
          hideTimer.current = window.setTimeout(() => setMessages([]), TICKER_DURATION_MS);
        }
      } catch {
        // O alerta nao deve interromper o uso do portal se a verificacao falhar.
      }
    }

    void checkCertificates();
    const interval = window.setInterval(() => void checkCertificates(), CHECK_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  if (!messages.length) return null;

  return (
    <div className="certificate-expiry-ticker" role="status" aria-live="polite">
      <div key={runId} className="certificate-expiry-ticker__message">
        <AlertTriangle size={19} aria-hidden="true" />
        <span>{messages.join('  •  ')}</span>
      </div>
    </div>
  );
}
