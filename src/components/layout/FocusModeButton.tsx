import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFocusMode } from '../../hooks/useFocusMode';

export function FocusModeButton({ className = '' }: { className?: string }) {
  const { enabled, toggle } = useFocusMode();

  return (
    <Button variant={enabled ? 'primary' : 'secondary'} onClick={toggle} className={className} title={enabled ? 'Mostrar menu lateral' : 'Ocultar menu lateral'}>
      {enabled ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      {enabled ? 'Mostrar menu' : 'Modo foco'}
    </Button>
  );
}
