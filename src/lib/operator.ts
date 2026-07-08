export type LocalOperator = {
  operator_name: string;
  operator_id: string;
  device_id: string;
  created_at: string;
};

const STORAGE_KEY = 'nota_flow_operator';
const MEMORY_DEVICE_KEY = 'nota_flow_device_id';

let memoryOperator: LocalOperator | null = null;
let memoryDeviceId: string | null = null;
let storageWarning = false;

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.random() * 16 | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function canUseStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const key = '__nota_flow_storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    storageWarning = true;
    return false;
  }
}

function readRaw(key: string) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    storageWarning = true;
    return null;
  }
}

function writeRaw(key: string, value: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    storageWarning = true;
    return false;
  }
}

function removeRaw(key: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    storageWarning = true;
  }
}

function normalizeName(name: string) {
  return name.replace(/\s+/g, ' ').trim();
}

function isValidOperator(value: unknown): value is LocalOperator {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<LocalOperator>;
  return Boolean(item.operator_name && item.operator_id && item.device_id && item.created_at);
}

export function getStorageWarning() {
  return storageWarning;
}

export function getOrCreateDeviceId() {
  if (memoryDeviceId) return memoryDeviceId;

  const current = readRaw(MEMORY_DEVICE_KEY);
  if (current) {
    memoryDeviceId = current;
    return current;
  }

  const operator = getOperator();
  if (operator?.device_id) {
    memoryDeviceId = operator.device_id;
    writeRaw(MEMORY_DEVICE_KEY, operator.device_id);
    return operator.device_id;
  }

  memoryDeviceId = uuid();
  writeRaw(MEMORY_DEVICE_KEY, memoryDeviceId);
  return memoryDeviceId;
}

export function getOperator(): LocalOperator | null {
  if (memoryOperator) return memoryOperator;

  const raw = readRaw(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isValidOperator(parsed)) {
      clearOperator();
      return null;
    }
    memoryOperator = parsed;
    memoryDeviceId = parsed.device_id;
    writeRaw(MEMORY_DEVICE_KEY, parsed.device_id);
    return parsed;
  } catch {
    clearOperator();
    return null;
  }
}

export function saveOperator(name: string): LocalOperator {
  const operatorName = normalizeName(name);
  if (operatorName.length < 2) {
    throw new Error('Informe um nome com pelo menos 2 caracteres.');
  }

  const operator: LocalOperator = {
    operator_name: operatorName,
    operator_id: uuid(),
    device_id: getOrCreateDeviceId(),
    created_at: new Date().toISOString(),
  };

  memoryOperator = operator;
  writeRaw(STORAGE_KEY, JSON.stringify(operator));
  return operator;
}

export function clearOperator() {
  memoryOperator = null;
  removeRaw(STORAGE_KEY);
}

export function operatorHeaders(operator = getOperator()): Record<string, string> {
  if (!operator) return {};
  return {
    'X-Operator-Name': operator.operator_name,
    'X-Operator-Id': operator.operator_id,
    'X-Device-Id': operator.device_id,
  };
}
