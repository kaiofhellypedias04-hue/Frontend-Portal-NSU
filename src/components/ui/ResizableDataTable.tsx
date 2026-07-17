import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useElementWidth } from '../../hooks/useElementWidth';
import { classNames } from '../../lib/format';
import { Columns3 } from 'lucide-react';

type ColumnAlign = 'left' | 'center' | 'right';

export type ResizableDataColumn<T> = {
  key: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  label: string;
  align?: ColumnAlign;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => ReactNode;
};

type ResizableDataTableProps<T> = {
  columns: ResizableDataColumn<T>[];
  rows: T[];
  getRowKey: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  tableClassName?: string;
  wrapperClassName?: string;
  rowClassName?: string | ((item: T) => string);
  density?: 'compact' | 'normal';
  storageKey?: string;
};

const DEFAULT_MIN_WIDTH = 32;

function alignClass(align: ColumnAlign = 'left') {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function safeStorageGet(storageKey?: string): Record<string, number> {
  if (!storageKey || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, Number(value)] as const)
        .filter(([, value]) => Number.isFinite(value) && value > 0),
    );
  } catch {
    return {};
  }
}

function safeStorageSet(storageKey: string | undefined, widths: Record<string, number>) {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(widths));
  } catch {
    // LocalStorage indisponivel nao deve quebrar a tabela.
  }
}

function minWidthFor<T>(column: ResizableDataColumn<T>) {
  return Math.max(24, column.minWidth ?? DEFAULT_MIN_WIDTH);
}

function maxWidthFor<T>(column: ResizableDataColumn<T>) {
  return column.maxWidth ?? 1200;
}

function buildInitialWidths<T>(columns: ResizableDataColumn<T>[], storageKey?: string) {
  const saved = safeStorageGet(storageKey);
  const result: Record<string, number> = {};
  for (const column of columns) {
    const min = minWidthFor(column);
    const max = maxWidthFor(column);
    const preferred = saved[column.key] ?? column.width;
    result[column.key] = Math.min(max, Math.max(min, Number(preferred) || column.width || min));
  }
  return result;
}

export function ResizableDataTable<T>({
  columns: sourceColumns,
  rows,
  getRowKey,
  onRowClick,
  tableClassName,
  wrapperClassName,
  rowClassName,
  density = 'normal',
  storageKey,
}: ResizableDataTableProps<T>) {
  const [widths, setWidths] = useState<Record<string, number>>(() => buildInitialWidths(sourceColumns, storageKey));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const visibilityKey = storageKey ? `${storageKey}:hidden` : undefined;
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => { try { return visibilityKey ? JSON.parse(localStorage.getItem(visibilityKey) || '[]') as string[] : []; } catch { return []; } });
  const activeSourceColumns = useMemo(() => sourceColumns.filter((column) => !hiddenColumns.includes(column.key)), [sourceColumns, hiddenColumns]);
  const widthsRef = useRef(widths);
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const ignoreNextClickRef = useRef(false);
  const previousBodyStyleRef = useRef<{ userSelect: string; cursor: string } | null>(null);
  const tableArea = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    widthsRef.current = widths;
  }, [widths]);

  useEffect(() => {
    setWidths((previous) => {
      const next = { ...previous };
      let changed = false;
      const sourceKeys = new Set(activeSourceColumns.map((column) => column.key));

      for (const key of Object.keys(next)) {
        if (!sourceKeys.has(key)) {
          delete next[key];
          changed = true;
        }
      }

      for (const column of activeSourceColumns) {
        const min = minWidthFor(column);
        const max = maxWidthFor(column);
        const current = next[column.key];
        const normalized = Math.min(max, Math.max(min, Number(current) || column.width));
        if (current !== normalized) {
          next[column.key] = normalized;
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [activeSourceColumns]);

  const columns = useMemo(
    () => activeSourceColumns.map((column) => ({ ...column, width: widths[column.key] ?? column.width })),
    [activeSourceColumns, widths],
  );
  const totalWidth = useMemo(() => columns.reduce((total, column) => total + column.width, 0), [columns]);
  const fillerWidth = Math.max(0, Math.floor(tableArea.width - totalWidth));
  const tableWidth = Math.max(totalWidth, tableArea.width || totalWidth);
  const columnByKey = useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns]);
  const cellPadding = density === 'compact' ? 'px-2 py-2' : 'px-3 py-3';

  function finishResize() {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    resizingRef.current = null;
    if (previousBodyStyleRef.current) {
      document.body.style.userSelect = previousBodyStyleRef.current.userSelect;
      document.body.style.cursor = previousBodyStyleRef.current.cursor;
      previousBodyStyleRef.current = null;
    }
    ignoreNextClickRef.current = true;
    window.setTimeout(() => {
      ignoreNextClickRef.current = false;
    }, 0);
    safeStorageSet(storageKey, widthsRef.current);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
  }

  function handlePointerMove(event: PointerEvent) {
    const resize = resizingRef.current;
    if (!resize) return;
    event.preventDefault();
    const column = columnByKey.get(resize.key);
    if (!column) return;
    const delta = event.clientX - resize.startX;
    const min = minWidthFor(column);
    const max = maxWidthFor(column);
    const nextWidth = Math.min(max, Math.max(min, resize.startWidth + delta));

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      setWidths((previous) => {
        if (previous[resize.key] === nextWidth) return previous;
        return { ...previous, [resize.key]: nextWidth };
      });
    });
  }

  function handlePointerUp() {
    finishResize();
  }

  function startResize(event: ReactPointerEvent, column: ResizableDataColumn<T>) {
    event.preventDefault();
    event.stopPropagation();
    resizingRef.current = {
      key: column.key,
      startX: event.clientX,
      startWidth: widthsRef.current[column.key] ?? column.width,
    };
    previousBodyStyleRef.current = {
      userSelect: document.body.style.userSelect,
      cursor: document.body.style.cursor,
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }

  useEffect(() => () => finishResize(), []);

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (!onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  }

  return (
    <div className={classNames('min-w-0', wrapperClassName)}>
      {storageKey ? <div className="relative flex justify-end border-b border-borderSoft bg-panel px-3 py-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-textBody hover:bg-panel2" onClick={() => setColumnsOpen((value) => !value)}><Columns3 size={17} /> Colunas</button>{columnsOpen ? <div className="absolute right-3 top-12 z-30 max-h-72 w-64 overflow-auto rounded-xl border border-borderSoft bg-panel p-2 shadow-card">{sourceColumns.map((column) => { const visible = !hiddenColumns.includes(column.key); return <label key={column.key} className="flex min-h-10 items-center gap-3 rounded-lg px-2 text-sm text-textBody hover:bg-panel2"><input type="checkbox" checked={visible} disabled={visible && activeSourceColumns.length === 1} onChange={() => { const next = visible ? [...hiddenColumns, column.key] : hiddenColumns.filter((key) => key !== column.key); setHiddenColumns(next); if (visibilityKey) localStorage.setItem(visibilityKey, JSON.stringify(next)); }} />{column.label}</label>; })}</div> : null}</div> : null}
      <div ref={tableArea.ref} className="resizable-table-scroll w-full min-w-0 overflow-x-auto">
        <table
          className={classNames('resizable-table table-fixed border-collapse text-left text-sm', tableClassName)}
          style={{ width: tableWidth || '100%' }}
        >
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
            {fillerWidth > 0 ? <col style={{ width: fillerWidth }} /> : null}
          </colgroup>
          <thead className="bg-panelInset text-xs uppercase tracking-[0.12em] text-textSoft">
            <tr>
              {columns.map((column) => {
                const definition = columnByKey.get(column.key);
                return (
                  <th
                    key={column.key}
                    className={classNames('resizable-th relative overflow-visible font-semibold', cellPadding, alignClass(definition?.align), definition?.headerClassName)}
                    style={{ width: column.width }}
                  >
                    <span className="block min-w-0 whitespace-normal break-words pr-2 leading-tight">{definition?.label ?? column.key}</span>
                    <span
                      aria-hidden="true"
                      className="group absolute bottom-0 right-[-4px] top-0 z-20 w-2 cursor-col-resize select-none touch-none"
                      onPointerDown={(event) => startResize(event, column)}
                    >
                      <span className="absolute bottom-1 top-1 left-1/2 w-px -translate-x-1/2 bg-accent/0 transition group-hover:bg-accent/80" />
                    </span>
                  </th>
                );
              })}
              {fillerWidth > 0 ? <th aria-hidden="true" className="p-0" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-borderSoft/70">
            {rows.map((row) => {
              const extraRowClass = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;
              return (
                <tr
                  key={getRowKey(row)}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={classNames(
                    'render-optimized',
                    onRowClick && 'cursor-pointer transition hover:bg-panel2 focus:outline-none focus-visible:bg-panel2 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent/60',
                    extraRowClass,
                  )}
                  onClick={() => {
                    if (!onRowClick || resizingRef.current || ignoreNextClickRef.current) return;
                    onRowClick(row);
                  }}
                  onKeyDown={(event) => handleRowKeyDown(event, row)}
                >
                  {columns.map((column) => {
                    const definition = columnByKey.get(column.key);
                    return (
                      <td
                        key={column.key}
                        className={classNames('overflow-hidden whitespace-nowrap text-textBody', cellPadding, alignClass(definition?.align), definition?.cellClassName)}
                        style={{ width: column.width }}
                      >
                        <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                          {definition?.render(row)}
                        </div>
                      </td>
                    );
                  })}
                  {fillerWidth > 0 ? <td aria-hidden="true" className="p-0" /> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
