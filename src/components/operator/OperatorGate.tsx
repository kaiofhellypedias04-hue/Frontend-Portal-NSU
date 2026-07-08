import type { ReactNode } from 'react';
import { useOperatorContext } from '../../hooks/useOperator';
import { OperatorNameModal } from './OperatorNameModal';

export function OperatorGate({ children }: { children: ReactNode }) {
  const { operator, storageWarning, saveOperator } = useOperatorContext();

  if (!operator) {
    return <OperatorNameModal storageWarning={storageWarning} onSubmit={saveOperator} />;
  }

  return <>{children}</>;
}
