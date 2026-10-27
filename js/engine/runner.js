/** Запуск кода в изолированном Web Worker с таймаутом; для DOM-уроков — iframe. */
import { runInSandbox } from './sandbox.js';
import { runDomTask } from './dom-sandbox.js';

// The worker is a timeout boundary, not a hardened security sandbox. Hide common
// network/storage APIs to reduce accidental side effects from learner examples.
const SRC = 'const run=' + runInSandbox.toString() + ';' +
  'const send=self.postMessage.bind(self);' +
  'for(const k of [\'fetch\',\'importScripts\',\'WebSocket\',\'EventSource\',\'XMLHttpRequest\',\'indexedDB\',\'caches\',\'BroadcastChannel\',\'Worker\',\'SharedWorker\']){' +
  'try{Object.defineProperty(self,k,{value:undefined,writable:false,configurable:false})}catch{}' +
  '}' +
  'self.onmessage=async function(e){try{send(await run(e.data))}catch(err){send({logs:[],results:[],error:String(err&&err.message||err)})}};';

export function runCode(code, opts) {
  const { tests = '', mode = 'task', timeout = 3000, domHtml } = opts || {};

  // Если это DOM-урок (есть domHtml), используем iframe-песочницу
  if (domHtml !== undefined && mode === 'task') {
    return runDomTask({ html: domHtml, code, tests, timeout: timeout || 5000 });
  }

  const payload = { code, tests, mode };
  return new Promise((resolve) => {
    if (typeof Worker === 'undefined') {           // тесты в Node/jsdom
      runInSandbox(payload).then(resolve);
      return;
    }
    let worker, url, timer, finished = false;
    const done = (r) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(r);
    };
    try {
      url = URL.createObjectURL(new Blob([SRC], { type: 'text/javascript' }));
      worker = new Worker(url);
    } catch (e) {
      done({ logs: [], results: [], error: 'Не удалось создать изолированный поток для запуска кода: ' + e.message });
      return;
    }
    worker.onmessage = (e) => done(e.data);
    worker.onerror = (e) => done({ logs: [], results: [], error: e.message || 'Ошибка выполнения' });
    timer = setTimeout(() => done({ logs: [], results: [], error: 'Превышено время выполнения (' + timeout / 1000 + ' с). Скорее всего, в коде бесконечный цикл или слишком глубокая рекурсия.', timeout: true }), timeout);
    worker.postMessage(payload);
  });
}
