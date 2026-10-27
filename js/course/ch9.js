import { run, c } from './h.js';

export default {
  id: 'async', title: 'Асинхронный JavaScript',
  lessons: [
    {
      id: 'promises', t: 'Promise и цепочки then',
      th: `
<h2>1. Синхронный и асинхронный код</h2>
<p><b>Синхронный</b> код выполняется последовательно: следующая инструкция ждёт предыдущую. Но некоторые операции занимают неизвестное время — например, запрос к серверу. Блокировать программу на всё это время неудобно.</p>
<p><b>Асинхронный</b> код позволяет начать операцию и продолжить работу, а результат получить позже.</p>
${run('console.log("Начало");\nsetTimeout(() => console.log("таймер"), 0);\nconsole.log("Конец");')}

<h2>2. Promise</h2>
<p>${c('Promise')} — объект, представляющий результат операции, который появится позже. У него три состояния: <b>pending</b> (ожидание), <b>fulfilled</b> (успех), <b>rejected</b> (ошибка).</p>
${run('const p = Promise.resolve(10);\np.then(value => console.log("получили:", value));\nconsole.log("это выполняется раньше then")')}

<h2>3. then и catch</h2>
${run('Promise.resolve(5)\n  .then(x => x * 2)\n  .then(x => { console.log(x); return x + 1; })\n  .then(x => console.log(x))\n  .catch(error => console.log("ошибка:", error.message));')}
<p>Каждый ${c('then')} получает результат предыдущего шага и может вернуть новое значение для следующего. Если внутри ${c('then')} бросить ошибку или вернуть rejected Promise, управление передаётся в ${c('catch')}.</p>

<h2>4. Создание Promise</h2>
${run('const p = new Promise((resolve, reject) => {\n  const ok = true;\n  if (ok) resolve("данные получены");\n  else reject(new Error("сбой"));\n});\np.then(v => console.log("успех:", v)).catch(e => console.log("отказ:", e.message));')}
<p>Функция-исполнитель вызывается сразу при создании Promise. Вызов ${c('resolve')} переводит Promise в fulfilled, ${c('reject')} — в rejected. Повторные вызовы игнорируются.</p>

<h2>5. Статические методы</h2>
<ul>
<li>${c('Promise.resolve(value)')} — уже выполненный Promise;</li>
<li>${c('Promise.reject(error)')} — уже отклонённый Promise;</li>
<li>${c('Promise.all([...])')} — ждёт все промисы, возвращает массив результатов;</li>
<li>${c('Promise.race([...])')} — ждёт первый завершившийся.</li>
</ul>
<div class="note"><b>Модель в голове:</b> Promise — это не само готовое значение, а «обещание дать значение позже».</div>
<h2>Как читать этот урок</h2><p>Разделяйте создание Promise, его успешное завершение и обработку результата. then описывает действие после успешного завершения, catch — реакцию на ошибку.</p><div class="note"><b>Что должно остаться в голове:</b> Понимать состояния pending, fulfilled и rejected, а также уметь обработать результат и ошибку Promise.</div>
`,
      task: {
        text: 'Напишите функцию delayValue(value, ms): она возвращает Promise, который успешно завершается через ms миллисекунд со значением value. Если ms <= 0, Promise завершается сразу. Также напишите функция timeout(ms), которая возвращает Promise, отклоняемый с Error("timeout") через ms мс.',
        starter: 'function delayValue(value, ms) {\n  // ваш код\n}\n\nfunction timeout(ms) {\n  // ваш код\n}\n',
        tests: `
test('delayValue возвращает Promise', () => assert(delayValue(5, 10) instanceof Promise, 'Нужен Promise'));
test('delayValue даёт значение', async () => eq(await delayValue('ok', 10), 'ok'));
test('delayValue с ms=0 работает', async () => eq(await delayValue(42, 0), 42));
test('timeout отклоняется', async () => { let err = null; try { await timeout(5); } catch (e) { err = e; } assert(err !== null, 'Должна быть ошибка'); });
test('timeout сообщение об ошибке', async () => { let msg = ""; try { await timeout(5); } catch (e) { msg = e.message; } eq(msg, 'timeout'); });
test('Promise.all с delayValue', async () => { const [a, b] = await Promise.all([delayValue(1, 5), delayValue(2, 10)]); eq(a, 1); eq(b, 2); });`,
        hints: [
          'delayValue: return new Promise(resolve => setTimeout(() => resolve(value), Math.max(0, ms)));',
          'Для ms <= 0 можно использовать Promise.resolve(value) без таймера.',
          'timeout: return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));'
        ],
        solution: 'function delayValue(value, ms) {\n  return new Promise((resolve) => {\n    if (ms <= 0) resolve(value);\n    else setTimeout(() => resolve(value), ms);\n  });\n}\n\nfunction timeout(ms) {\n  return new Promise((_, reject) => {\n    setTimeout(() => reject(new Error("timeout")), ms);\n  });\n}'
      }
    },
    {
      id: 'async-await', t: 'async и await',
      th: `
<h2>1. Зачем нужен async/await</h2>
<p>Цепочки ${c('.then()')} работают, но длинные цепочки иногда трудно читать. ${c('async/await')} позволяет записывать асинхронную последовательность почти как обычный код.</p>
${run('function getValue() {\n  return Promise.resolve(42);\n}\nasync function main() {\n  const value = await getValue();\n  console.log(value);\n}\nmain().then(() => console.log("main завершился"));')}

<h2>2. Что делает async</h2>
<p>Функция с ${c('async')} <b>всегда возвращает Promise</b>, даже если внутри написано обычное значение:</p>
${run('async function answer() { return 42; }\nanswer().then(console.log);')}

<h2>3. Что делает await</h2>
<p>${c('await')} ждёт завершения Promise внутри ${c('async')}-функции и даёт получить его результат как обычное значение. Код ниже ${c('await')} не выполнится, пока Promise не разрешится.</p>
${run('async function demo() {\n  const a = await Promise.resolve(10);\n  const b = await Promise.resolve(20);\n  return a + b;\n}\ndemo().then(console.log);')}

<h2>4. Обработка ошибок</h2>
${run('async function risky() {\n  try {\n    const val = await Promise.reject(new Error("Сбой")); \n    console.log(val);\n  } catch (error) {\n    console.log(error.message);\n    return "fallback";\n  }\n}\nrisky().then(console.log);')}
<p>${c('try/catch')} работает с ${c('await')} так же, как с синхронным кодом. Это одно из главных преимуществ async/await над цепочками then.</p>

<h2>5. Последовательно или параллельно</h2>
<p>Если две независимые операции не должны ждать друг друга, их можно запустить одновременно и дождаться обеих через ${c('Promise.all()')}:</p>
${run('async function parallel() {\n  const start = Date.now();\n  const [a, b] = await Promise.all([\n    Promise.resolve(1),\n    Promise.resolve(2)\n  ]);\n  console.log("результаты:", a, b);\n  console.log("выполнено параллельно");\n}\nparallel();')}

<div class="note"><b>Важно:</b> ${c('await')} не «замораживает весь браузер». Он приостанавливает только выполнение текущей async-функции, позволяя остальному JavaScript продолжать работу.</div>
<h2>Как читать этот урок</h2><p>Найдите место, где функция ждёт результат, и решите, какие операции зависят друг от друга. Независимые операции можно запускать параллельно, а ошибки ожидания обрабатывать через try/catch.</p><div class="note"><b>Что должно остаться в голове:</b> Понимать, что async возвращает Promise, await ждёт его результат, а try/catch обрабатывает отказ.</div>
`,
      task: {
        text: 'Напишите async-функцию safeExec(fn, fallback): она вызывает fn(), ожидает её результат через await, и если fn вернула rejected Promise или бросила ошибку — возвращает fallback. Если fn не является функцией, тоже верните fallback.',
        starter: 'async function safeExec(fn, fallback) {\n  // ваш код\n}\n',
        tests: `
test('успешная функция', async () => eq(await safeExec(async () => 42, -1), 42));
test('обычная синхронная функция', async () => eq(await safeExec(() => 10, -1), 10));
test('отклонённый Promise', async () => eq(await safeExec(() => Promise.reject(new Error("x")), "err"), "err"));
test('брошенное исключение', async () => eq(await safeExec(() => { throw new Error("boom"); }, "safe"), "safe"));
test('fn не функция', async () => eq(await safeExec(42, "default"), "default"));
test('fn === null', async () => eq(await safeExec(null, "null-fallback"), "null-fallback"));
test('fn === undefined', async () => eq(await safeExec(undefined, "undef"), "undef"));`,
        hints: [
          'Проверьте typeof fn !== "function" перед вызовом.',
          'Оберните вызов fn() в try/catch внутри async-функции.',
          'Результат fn() может быть Promise или обычным значением — await работает с обоими.'
        ],
        solution: 'async function safeExec(fn, fallback) {\n  if (typeof fn !== "function") return fallback;\n  try {\n    return await fn();\n  } catch {\n    return fallback;\n  }\n}'
      }
    },
    {
      id: 'event-loop', t: 'Event loop, микрозадачи и макрозадачи',
      th: `
<h2>1. Как JavaScript выполняет асинхронный код</h2>
<p>JavaScript однопоточен: в любой момент времени выполняется одна задача. Асинхронные операции (таймеры, сетевые запросы) ставятся в очередь, а результат возвращается, когда поток свободен.</p>
<p><b>Event loop</b> — механизм, который чередует выполнение задач и проверку очереди событий.</p>

<h2>2. Макрозадачи и микрозадачи</h2>
<p><b>Макрозадачи</b>: ${c('setTimeout')}, ${c('setInterval')}, события ввода, сетевые ответы. Каждая макрозадача выполняется целиком, между ними браузер обновляет интерфейс.</p>
<p><b>Микрозадачи</b>: ${c('Promise.then')}/${c('catch')}/${c('finally')}, ${c('queueMicrotask')}. Они выполняются <b>сразу после</b> текущей задачи, прежде чем начнётся следующая макрозадача.</p>
${run('console.log("1: старт");\nsetTimeout(() => console.log("4: макрозадача (timeout)"), 0);\nPromise.resolve().then(() => console.log("3: микрозадача (promise)"));\nconsole.log("2: конец синхронного блока");')}
<p>Порядок вывода: 1 → 2 → 3 → 4. Микрозадача выполняется раньше, чем таймер, потому что микрозадачи идут перед следующей макрозадачей.</p>

<h2>3. Цепочки Promise и порядок</h2>
${run('const results = [];\nresults.push("A");\nPromise.resolve().then(() => { results.push("B"); return 1; }).then(() => { results.push("C"); });\nsetTimeout(() => { results.push("D"); console.log(results.join(", ")); }, 50);\nresults.push("E");')}
<p>A и E добавляются синхронно, B и C — в микрозадачах Promise, D — в макрозадаче setTimeout. Ожидаемый порядок: A, E, B, C, D.</p>

<h2>4. Практическое применение</h2>
<p>Знание порядка полезно:</p>
<ul>
<li>для тестирования: если вы проверяете результат в ${c('setTimeout')}, нужно убедиться, что промисы уже разрешились;</li>
<li>для оптимизации UI: тяжёлые вычисления лучше дробить между кадрами;</li>
<li>для понимания, почему ${c('await')} не блокирует весь поток.</li>
</ul>

<h2>5. await vs then</h2>
${run('async function testAwait() {\n  console.log("перед await");\n  await Promise.resolve();\n  console.log("после await");\n}\ntestAwait();\nconsole.log("синхронный код после вызова");')}
<p>${c('await')} — это синтаксический сахар над ${c('.then()')}: код после await попадает в микрозадачу, а не выполняется сразу.</p>

<div class="note"><b>Главное правило:</b> синхронный код → все микрозадачи (включая те, что появились во время обработки микрозадач) → одна макрозадача → повторить.</div>
<h2>Как читать этот урок</h2><p>Определите, что выполняется синхронно, что поставлено в микрозадачи (Promise), что в макрозадачи (setTimeout). Порядок выполнения всегда: сначала весь синхронный код, затем микрозадачи, затем первая макрозадача.</p><div class="note"><b>Что должно остаться в голове:</b> Promise-колбэки всегда выполняются раньше setTimeout с нулевой задержкой; await приостанавливает только свою async-функцию.</div>
`,
      task: {
        text: 'Напишите функцию orderOfOperations(): она должна вызвать setTimeout, Promise.resolve().then и queueMicrotask с колбэками, которые добавляют строки в массив log. Функция возвращает этот массив ПОСЛЕ того, как все асинхронные операции завершатся. Верните строку join(","). Пример ожидаемого: ["sync", "micro-promise", "micro-queue", "macro-timeout"].join(",")',
        starter: 'function orderOfOperations() {\n  // ваш код\n}\n',
        tests: `
test('возвращается Promise', () => assert(orderOfOperations() instanceof Promise, 'Функция должна возвращать Promise'));
test('правильный порядок операций', async () => eq(await orderOfOperations(), 'sync,micro-promise,micro-queue,macro-timeout'));
test('все четыре элемента присутствуют', async () => { const r = await orderOfOperations(); eq(r.split(",").length, 4); });
test('sync идёт первым', async () => { const r = await orderOfOperations(); eq(r.split(",")[0], 'sync'); });
test('macro-timeout идёт последним', async () => { const r = await orderOfOperations(); eq(r.split(",")[3], 'macro-timeout'); });`,
        hints: [
          'Используйте new Promise, который резолвится в setTimeout.',
          'log.push("sync") выполняется сразу.\nPromise.resolve().then(() => log.push("micro-promise"))\nqueueMicrotask(() => log.push("micro-queue"))\nsetTimeout(() => { log.push("macro-timeout"); resolve(log.join(",")) }, 0)',
          'queueMicrotask доступна в браузере и Node.'
        ],
         solution: 'function orderOfOperations() {\n  const log = [];\n  log.push("sync");\n  Promise.resolve().then(() => { log.push("micro-promise"); });\n  queueMicrotask(() => { log.push("micro-queue"); });\n  return new Promise((resolve) => {\n    setTimeout(() => { log.push("macro-timeout"); resolve(log.join(",")); }, 0);\n  });\n}'
       }
     },
     {
      id: 'async-review', t: 'Объединяем асинхронность',
      th: `
<h2>1. Promise.all — параллельные запросы</h2>
<p>Когда несколько независимых асинхронных операций не должны ждать друг друга, запускают их одновременно и ждут всех через ${c('Promise.all')}:</p>
${run('const p1 = Promise.resolve(1);\nconst p2 = Promise.resolve(2);\nPromise.all([p1, p2]).then(v => console.log(v));')}

<h2>2. Promise.allSettled — результаты всех</h2>
<p>Если ${c('Promise.all')} падает на первой ошибке, используйте ${c('Promise.allSettled')}: он ждёт все и показывает статус каждого:</p>
${run('const ok = Promise.resolve("ok");\nconst bad = Promise.reject(new Error("fail"));\nPromise.allSettled([ok, bad]).then(r => r.forEach(x => console.log(x.status)));')}

<h2>3. Promise.race — первый завершившийся</h2>
<p>${c('Promise.race')} ждёт первый завершившийся промис. Удобен для таймаутов — гоняем два промиса и берём победителя:</p>
${run('const slow = new Promise(r => setTimeout(() => r("slow"), 50));\nconst fast = new Promise(r => setTimeout(() => r("fast"), 10));\nPromise.race([slow, fast]).then(w => console.log("winner:", w));')}

<h2>4. Ошибки в async/await</h2>
<p>В ${c('async')}-функции ${c('try/catch')} ловит и отклонённые Promise, и брошенные ошибки. Без try/catch не пойманная ошибка отклонит возвращаемый Promise:</p>
${run('async function risky() {\n  try {\n    const v = await Promise.reject(new Error("boom"));\n    console.log(v);\n  } catch (e) {\n    console.log("поймано:", e.message);\n    return "recovery";\n  }\n}\nrisky().then(console.log);')}

<h2>5. Где что применять</h2>
<ul>
<li>${c('Promise.all')} — когда все операции обязаны succeed и нужны все результаты;</li>
<li>${c('Promise.allSettled')} — когда частичные сбои допустимы;</li>
<li>${c('Promise.race')} — для таймаутов и «gossip» запросов;</li>
<li>${c('try/catch')} — для обработки ошибок в async/await.</li>
</ul>
<div class="note"><b>Важно:</b> независимые операции запускаются ПАРАЛЛЕЛЬНО через Promise.all, а не последовательно через await друг за другом.</div>
<h2>Как читать этот урок</h2><p>Определите требования: все должны пройти (all), допустимы частичные сбои (allSettled), нужен первый результат (race). Обрабатывайте ошибки на каждом этапе через catch или try/catch.</p><div class="note"><b>Что должно остаться в голове:</b> Promise.all падает на первой ошибке; Promise.allSettled ждёт всех; Promise.race берёт первый результат; try/catch ловит ошибки в async/await.</div>
`,
      task: {
        text: 'Напишите async-функцию fetchUsers(userIds): она принимает массив ID. Для каждого вызывает fetchUser(id), который возвращает { id, name } или бросает Error("not found"). Используйте Promise.allSettled: успешные результаты возвращаются как есть, неудачные — как { id, error: "not found" }. Исходный массив не мутируйте.',
        starter: 'async function fetchUsers(userIds) {\n  // ваш код\n}\n',
        tests: `
test('все успешны', async () => {
  globalThis.fetchUser = id => Promise.resolve({ id, name: "User" + id });
  const result = await fetchUsers([1, 2]);
  eq(result, [{ id: 1, name: "User1" }, { id: 2, name: "User2" }]);
});
test('смешанные: успех и ошибка', async () => {
  globalThis.fetchUser = id => id === 2 ? Promise.reject(new Error("not found")) : Promise.resolve({ id, name: "U" + id });
  const result = await fetchUsers([1, 2, 3]);
  eq(result.length, 3);
  eq(result[0], { id: 1, name: "U1" });
  eq(result[1], { id: 2, error: "not found" });
  eq(result[2], { id: 3, name: "U3" });
});
test('все пропали', async () => {
  globalThis.fetchUser = () => Promise.reject(new Error("not found"));
  const result = await fetchUsers([5]);
  eq(result[0].error, "not found");
});
test('пустой массив', async () => {
  eq(await fetchUsers([]), []);
});
test('не мутирует входной массив', async () => {
  globalThis.fetchUser = id => Promise.resolve({ id });
  const ids = [1, 2];
  await fetchUsers(ids);
  eq(ids, [1, 2]);
});`,
        hints: [
          'Используйте Promise.allSettled(userIds.map(id => fetchUser(id))).',
          'allSettled возвращает массив { status: "fulfilled", value } или { status: "rejected", reason }. Для отклонённых reason — это Error, reason.message — "not found".',
          'Сопоставьте результаты с исходными ID через индекс: userIds[i].'
        ],
        solution: 'async function fetchUsers(userIds) {\n  const results = await Promise.allSettled(userIds.map(id => fetchUser(id)));\n  return results.map((r, i) => {\n    if (r.status === "fulfilled") return r.value;\n    return { id: userIds[i], error: r.reason.message };\n  });\n}'
      }
     }
   ]
};
