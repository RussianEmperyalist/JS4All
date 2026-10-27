/** Прогресс и черновики кода. Данные остаются в браузере пользователя. */
const KEY = 'jsforall';
let S = { done: {}, code: {} };

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { /* Хранилище может быть недоступно в приватном режиме или при запрете браузера. */ }
};
const onlyKnown = (record, ids, predicate) => {
  const out = {};
  for (const [id, value] of Object.entries(record)) {
    if ((!ids || ids.has(id)) && predicate(value)) out[id] = value;
  }
  return out;
};

export function loadState(lessonIds) {
  try {
    const raw = localStorage.getItem(KEY);
    const x = raw ? JSON.parse(raw) : null;
    if (isRecord(x)) {
      const ids = Array.isArray(lessonIds) ? new Set(lessonIds) : null;
      S = {
        done: onlyKnown(isRecord(x.done) ? x.done : {}, ids, (v) => v === 1 || v === true),
        code: onlyKnown(isRecord(x.code) ? x.code : {}, ids, (v) => typeof v === 'string')
      };
    }
  } catch (e) { S = { done: {}, code: {} }; }
  return S;
}
export const isDone = (id) => S.done[id] === 1 || S.done[id] === true;
export const doneCount = () => Object.values(S.done).filter((v) => v === 1 || v === true).length;
export function markDone(id) { S.done[id] = 1; persist(); }
export const getCode = (id) => S.code[id];
export function setCode(id, text) {
  if (text === undefined) delete S.code[id];
  else if (typeof text === 'string') S.code[id] = text;
  persist();
}
export function resetAll() { S = { done: {}, code: {} }; persist(); }
export const exportData = () => JSON.stringify({ app: 'jsforall', version: 1, ...S }, null, 2);
export function importData(text, lessonIds) {
  let x;
  try { x = JSON.parse(text); }
  catch { throw new Error('Файл прогресса повреждён: это не корректный JSON.'); }
  if (!isRecord(x) || x.app !== 'jsforall' || !isRecord(x.done) || (x.code !== undefined && !isRecord(x.code))) {
    throw new Error('Это не файл прогресса JS 4All.');
  }
  const ids = Array.isArray(lessonIds) ? new Set(lessonIds) : null;
  const importedDone = onlyKnown(x.done, ids, (v) => v === 1 || v === true);
  const importedCode = onlyKnown(isRecord(x.code) ? x.code : {}, ids, (v) => typeof v === 'string');
  // Импортированный файл должен иметь приоритет над локальными черновиками.
  S = { done: { ...S.done, ...importedDone }, code: { ...S.code, ...importedCode } };
  persist();
}
