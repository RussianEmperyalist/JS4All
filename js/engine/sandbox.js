/**
 * Выполнение кода ученика и тестов.
 * ВАЖНО: функция должна быть полностью самодостаточной (никаких импортов и внешних
 * переменных) — её исходный текст передаётся в Web Worker через toString().
 */
export async function runInSandbox(p) {
  const logs = [];
  const results = [];
  const seen = new Set();

  function fmt(v, top, d) {
    d = d || 0;
    if (typeof v === 'string') return top ? v : JSON.stringify(v);
    if (typeof v === 'function') return '[Function' + (v.name ? ': ' + v.name : '') + ']';
    if (typeof v === 'bigint') return String(v) + 'n';
    if (typeof v === 'symbol') return String(v);
    if (v === null || typeof v !== 'object') return Object.is(v, -0) ? '-0' : String(v);
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (seen.has(v)) return '[Circular]';
    if (d > 3) return Array.isArray(v) ? '[…]' : '{…}';
    seen.add(v);
    try {
      if (Array.isArray(v)) return '[' + v.map(function (x) { return fmt(x, false, d + 1); }).join(', ') + ']';
      if (v instanceof Map) return 'Map(' + v.size + ') {' + Array.from(v).map(function (e) { return fmt(e[0], false, d + 1) + ' => ' + fmt(e[1], false, d + 1); }).join(', ') + '}';
      if (v instanceof Set) return 'Set(' + v.size + ') {' + Array.from(v).map(function (x) { return fmt(x, false, d + 1); }).join(', ') + '}';
      return '{' + Object.keys(v).map(function (k) {
        return (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + fmt(v[k], false, d + 1);
      }).join(', ') + '}';
    } finally { seen.delete(v); }
  }

  function deq(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (a instanceof Map && b instanceof Map) return deq(Array.from(a), Array.from(b));
    if (a instanceof Set && b instanceof Set) return deq(Array.from(a), Array.from(b));
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return Object.prototype.hasOwnProperty.call(b, k) && deq(a[k], b[k]); });
  }

  function friendly(e) {
    if (e && e.isTest) return e.message;
    const m = String(e && e.message);
    let x;
    if ((x = /^(\S+) is not defined/.exec(m))) return 'Имя «' + x[1] + '» не определено. Проверьте, что вы объявили его (let, const или function) и написали точно так, как в задании.';
    if ((x = /^(.+) is not a function/.exec(m))) return '«' + x[1] + '» не является функцией. Проверьте название и скобки при вызове.';
    if (/Maximum call stack/.test(m)) return 'Слишком глубокая рекурсия: у функции нет условия остановки или оно не достигается.';
    if (/Assignment to constant/.test(m)) return 'Нельзя изменить значение, объявленное через const. Используйте let, если значение должно меняться.';
    return (e && e.name ? e.name : 'Error') + ': ' + m;
  }

  const tErr = function (m) { const er = new Error(m); er.isTest = true; return er; };
  const out = function (type) {
    return function () {
      logs.push({ type: type, text: Array.prototype.map.call(arguments, function (x) { return fmt(x, true); }).join(' ') });
    };
  };
  const con = { log: out('log'), info: out('log'), debug: out('log'), warn: out('warn'), error: out('error') };
  const queue = [];
  const test = function (name, fn) { queue.push({ name: name, fn: fn }); };
  const eq = function (actual, expected, msg) {
    if (!deq(actual, expected)) throw tErr((msg ? msg + ': ' : '') + 'ожидалось ' + fmt(expected) + ', получено ' + fmt(actual));
  };
  const assert = function (cond, msg) { if (!cond) throw tErr(msg || 'Условие не выполнено'); };

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  let error = null;
  let value;
  try {
    if (p.mode === 'snippet') {
      let fn;
      try { fn = new AsyncFunction('console', '"use strict"; return (' + p.code + '\n);'); }
      catch (e) { fn = new AsyncFunction('console', '"use strict";\n' + p.code); }
      value = await fn(con);
      if (value !== undefined) logs.push({ type: 'value', text: fmt(value, false) });
    } else {
      const fn = new AsyncFunction('console', 'test', 'eq', 'assert', 'source', '"use strict";\n' + p.code + '\n;\n' + (p.tests || ''));
      await fn(con, test, eq, assert, p.code);
    }
  } catch (e) {
    error = friendly(e);
  }

  if (!error) {
    for (const t of queue) {
      try { await t.fn(); results.push({ name: t.name, ok: true }); }
      catch (e) { results.push({ name: t.name, ok: false, message: friendly(e) }); }
    }
  }
  return { logs: logs, results: results, error: error };
}
