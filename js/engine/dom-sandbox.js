/**
 * Выполнение кода ученика в iframe со srcdoc и sandbox="allow-scripts".
 * Тесты обращаются к DOM через window.document внутри iframe.
 * Результат возвращается через postMessage.
 */

const DEFAULT_TIMEOUT = 5000;

/**
 * Собирает srcdoc для iframe: базовый HTML + код ученика + тесты.
 * @param {string} html - начальный HTML страницы (содержимое body).
 * @param {string} code - JS код ученика.
 * @param {string} tests - JS код тестов (функции получают document, window, eq, assert, test).
 * @returns {string} полный srcdoc для iframe.
 */
export function buildDomSrcdoc(html, code, tests) {
  // Экранируем обратные кавычки и \${ в пользовательском коде/тестах/html
  const safeHtml = escapeForTemplate(html || '');
  const safeCode = escapeForTemplate(code || '');
  const safeTests = escapeForTemplate(tests || '');

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:12px;margin:0}</style></head>
<body>
<div id="app">${safeHtml}</div>
<script>
(function() {
  "use strict";
  var logs = [];
  var results = [];
  var queue = [];

  function fmt(v, top, d, seen) {
    d = d || 0; seen = seen || new Set();
    if (typeof v === 'string') return top ? v : JSON.stringify(v);
    if (typeof v === 'function') return '[Function]';
    if (v === null || typeof v !== 'object') return String(v);
    if (seen.has(v)) return '[Circular]';
    if (d > 3) return Array.isArray(v) ? '[\u2026]' : '{\u2026}';
    seen.add(v);
    try {
      if (Array.isArray(v)) return '[' + v.map(function(x) { return fmt(x, false, d + 1, seen); }).join(', ') + ']';
      return '{' + Object.keys(v).map(function(k) { return k + ': ' + fmt(v[k], false, d + 1, seen); }).join(', ') + '}';
    } finally { seen.delete(v); }
  }

  function deq(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function(k) { return Object.prototype.hasOwnProperty.call(b, k) && deq(a[k], b[k]); });
  }

  function tErr(m) { var e = new Error(m); e.isTest = true; return e; }

  var out = function(type) {
    return function() {
      logs.push({ type: type, text: Array.prototype.map.call(arguments, function(x) { return fmt(x, true); }).join(' ') });
    };
  };
  var con = { log: out('log'), info: out('log'), warn: out('warn'), error: out('error') };

  var test = function(name, fn) { queue.push({ name: name, fn: fn }); };
  var eq = function(actual, expected, msg) {
    if (!deq(actual, expected)) throw tErr((msg ? msg + ': ' : '') + 'expected ' + fmt(expected) + ', got ' + fmt(actual));
  };
  var assert = function(cond, msg) { if (!cond) throw tErr(msg || 'Assertion failed'); };

  // Доступ к документу и вспомогательным API
  var doc = document;
  var win = window;

  try {
    // Выполняем код ученика
    var userFn = new Function('document', 'window', 'console', '"use strict";\\n' + '${safeCode}');
    userFn(doc, win, con);
  } catch(e) {
    parent.postMessage({ type: 'js4all-dom-result', logs: logs, results: [], error: (e.name || 'Error') + ': ' + e.message }, '*');
    return;
  }

  try {
    // Выполняем тесты (они могут использовать document, window, test, eq, assert)
    var testFn = new Function('document', 'window', 'test', 'eq', 'assert', 'console', '"use strict";\\n' + '${safeTests}');
    testFn(doc, win, test, eq, assert, con);
  } catch(e) {
    parent.postMessage({ type: 'js4all-dom-result', logs: logs, results: [], error: 'Tests setup: ' + (e.name || 'Error') + ': ' + e.message }, '*');
    return;
  }

  // Запускаем очередь тестов асинхронно
  var idx = 0;
  function runNext() {
    if (idx >= queue.length) {
      parent.postMessage({ type: 'js4all-dom-result', logs: logs, results: results, error: null }, '*');
      return;
    }
    var t = queue[idx++];
    try {
      var r = t.fn();
      if (r && typeof r.then === 'function') {
        r.then(function() { results.push({ name: t.name, ok: true }); runNext(); })
         .catch(function(e) { results.push({ name: t.name, ok: false, message: e.message || String(e) }); runNext(); });
      } else {
        results.push({ name: t.name, ok: true });
        runNext();
      }
    } catch(e) {
      results.push({ name: t.name, ok: false, message: e.message || String(e) });
      runNext();
    }
  }
  runNext();
})();
<\/script>
</body></html>`;
}

function escapeForTemplate(s) {
  // Экранируем обратные кавычки и последовательности ${ для безопасного встраивания в шаблонную строку
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\\${');
}

/**
 * Запускает DOM-задание в iframe.
 * @param {object} opts
 * @param {string} opts.html - начальное содержимое страницы (внутри #app).
 * @param {string} opts.code - код ученика.
 * @param {string} opts.tests - тесты для проверки DOM.
 * @param {number} [opts.timeout=5000] - мс.
 * @returns {Promise<{logs: Array, results: Array, error: string|null}>}
 */
export function runDomTask(opts) {
  const { html = '', code = '', tests = '', timeout = DEFAULT_TIMEOUT } = opts;

  return new Promise((resolve) => {
    // Создаём скрытый контейнер
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.cssText = 'width:100%;height:300px;border:1px solid #ccc';

    const srcdoc = buildDomSrcdoc(html, code, tests);

    let resolved = false;
    const cleanup = () => {
      window.removeEventListener('message', handler);
      clearTimeout(timer);
      setTimeout(() => { try { container.remove(); } catch {} }, 100);
    };

    const done = (result) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

    const handler = (event) => {
      if (event.data && event.data.type === 'js4all-dom-result') {
        done({
          logs: event.data.logs || [],
          results: event.data.results || [],
          error: event.data.error || null
        });
      }
    };

    window.addEventListener('message', handler);

    const timer = setTimeout(() => {
      done({ logs: [], results: [], error: '\u041f\u0440\u0435\u0432\u044b\u0448\u0435\u043d\u043e \u0432\u0440\u0435\u043c\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f (' + timeout / 1000 + ' \u0441).' });
    }, timeout);

    iframe.srcdoc = srcdoc;
    container.appendChild(iframe);
  });
}
