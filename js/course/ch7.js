import { run, c } from './h.js';

export default {
  id: 'errors', title: 'Ошибки и отладка',
  lessons: [
    {
      id: 'errors-debugging', t: 'Ошибки, throw и try/catch',
      th: `
<h2>1. Ошибка — это информация</h2>
<p>Ошибка сообщает, что программа не смогла выполнить то, что от неё требовалось. В JavaScript полезно различать <b>синтаксические ошибки</b>, <b>ошибки выполнения</b> и ошибки в самой логике программы.</p>
<ul>
<li><b>SyntaxError</b> — код написан с нарушением синтаксиса.</li>
<li><b>ReferenceError</b> — обращение к несуществующему имени.</li>
<li><b>TypeError</b> — операция не подходит полученному значению.</li>
<li><b>RangeError</b> — значение вышло за допустимый диапазон.</li>
</ul>
${run('try {\n  console.log(notDefined);\n} catch (error) {\n  console.log(error.name);\n  console.log(error.message);\n}')}

<h2>2. throw — создать ошибку самостоятельно</h2>
<p>Иногда функция получает неправильные данные и должна явно сообщить об этом. Для этого используется <code>throw</code>.</p>
<pre><code>function divide(a, b) {
  if (b === 0) {
    throw new Error("На ноль делить нельзя");
  }
  return a / b;
}</code></pre>

<h2>3. try/catch/finally</h2>
<p><code>try</code> содержит рискованный код, а <code>catch</code> перехватывает возникшую ошибку. Блок <code>finally</code> выполняется всегда — была ошибка или нет:</p>
${run('function safeDivide(a, b) {\n  if (b === 0) throw new TypeError("zero");\n  return a / b;\n}\ntry {\n  console.log(safeDivide(10, 2));\n  console.log(safeDivide(10, 0));\n} catch (e) {\n  console.log("перехвачено:", e.name, e.message);\n} finally {\n  console.log("готово");\n}')}

<h2>4. Иерархия встроенных ошибок</h2>
<p>Все встроенные ошибки наследуются от ${c('Error')}. Проверить тип можно через ${c('instanceof')} или по полю ${c('name')}:</p>
${run('const errors = [new TypeError("t"), new RangeError("r"), new Error("e")];\nfor (const e of errors) {\n  console.log(e.name + " | instanceof Error: " + (e instanceof Error) + " | message: " + e.message);\n}')}

<h2>5. Отладка как процесс</h2>
<ol>
<li>прочитайте сообщение об ошибке;</li>
<li>найдите строку и операцию, на которой программа остановилась;</li>
<li>проверьте значения переменных;</li>
<li>воспроизведите проблему на маленьком примере;</li>
<li>исправьте причину, а не просто удаляйте сообщение об ошибке.</li>
</ol>
<div class="note"><b>Главная мысль:</b> хорошая отладка — это поиск причины. <code>console.log()</code> и отладчик помогают увидеть, что программа делает на самом деле.</div>
<h2>Как читать этот урок</h2><p>Сначала прочитайте тип и сообщение ошибки, затем найдите место возникновения и сведите проблему к маленькому примеру. try/catch нужен для обработки ожидаемой ошибки, а не для сокрытия любого сбоя.</p><div class="note"><b>Что должно остаться в голове:</b> Уметь отличать синтаксическую ошибку от ошибки выполнения и использовать try/catch осознанно.</div>
`,
      task: {
        text: 'Напишите функцию safeDivide(a, b). Если b равно 0, она должна вернуть null. Если любой аргумент не число — выбросить TypeError с сообщением "not a number". В остальных случаях вернуть a / b. Используйте throw и try/catch.',
        starter: 'function safeDivide(a, b) {\n  // ваш код\n}\n',
        tests: `
test('обычное деление', () => eq(safeDivide(10, 2), 5));
test('деление на ноль возвращает null', () => eq(safeDivide(10, 0), null));
test('отрицательные числа', () => eq(safeDivide(-9, 3), -3));
test('строковый аргумент бросает TypeError', () => { let thrown = null; try { safeDivide("a", 2); } catch (e) { thrown = e; } assert(thrown instanceof TypeError, 'Нужен TypeError'); assert(/not a number/.test(thrown.message), 'Сообщение должно содержать "not a number"'); });
test('оба аргумента — нули: null', () => eq(safeDivide(0, 0), null));
test('undefined бросает TypeError', () => { let ok = false; try { safeDivide(undefined, 5); } catch (e) { ok = e instanceof TypeError; } assert(ok); });`,
        hints: ['Проверяйте typeof a !== "number" || typeof b !== "number" перед делением.', 'Для проверки «не ноль» используйте b === 0; при нуле верните null без throw.', 'Можно обернуть внутреннюю логику в try/catch и в catch проверить тип ошибки.'],
        solution: 'function safeDivide(a, b) {\n  if (typeof a !== "number" || Number.isNaN(a)) throw new TypeError("not a number");\n  if (typeof b !== "number" || Number.isNaN(b)) throw new TypeError("not a number");\n  if (b === 0) return null;\n  return a / b;\n}'
      }
    },
    {
      id: 'custom-errors', t: 'Пользовательские ошибки и паттерны обработки',
      th: `
<h2>1. Зачем свой класс ошибки</h2>
<p>${c('Error')} — базовый класс. Когда приложение имеет разные типы сбоев, удобно завести отдельные подклассы. Тогда ${c('catch')} может реагировать точечно:</p>
${run('class ValidationError extends Error {\n  constructor(field, msg) {\n    super(msg);\n    this.name = "ValidationError";\n    this.field = field;\n  }\n}\nclass NetworkError extends Error {\n  constructor(url, status) {\n    super("HTTP " + status + " at " + url);\n    this.name = "NetworkError";\n    this.status = status;\n  }\n}\ntry {\n  throw new ValidationError("email", "invalid format");\n} catch (e) {\n  console.log(e instanceof ValidationError);\n  console.log(e instanceof Error);\n  console.log(e.field, e.message);\n}')}

<h2>2. Правильное наследование от Error</h2>
<p>При расширении Error нужно вызывать <code>${c('super(message)')}</code> и вручную ставить <code>${c('this.name')}</code>, иначе ${c('e.name')} будет отображать <code>"Error"</code> вместо вашего имени. Также полезно вызвать <code>${c('Object.setPrototypeOf(this, NewClass.prototype)')}</code> если среда использует ES5-транспиляцию, но в современных браузерах и Node <code>${c('class ... extends')}</code> работает корректно.</p>

<h2>3. Паттерн «бросай, но не лови всё подряд»</h2>
<p>Не оборачивайте каждую строку в try/catch. Ловите ошибку там, где можете реально что-то сделать. Если не можете — пусть всплывёт выше:</p>
${run('class NotFoundError extends Error {\n  constructor(id) {\n    super("Not found: " + id);\n    this.name = "NotFoundError";\n    this.id = id;\n  }\n}\nfunction findUser(db, id) {\n  const u = db.find(x => x.id === id);\n  if (!u) throw new NotFoundError(id);\n  return u;\n}\nfunction getUserName(db, id) {\n  try {\n    return findUser(db, id).name;\n  } catch (e) {\n    if (e instanceof NotFoundError) return "гость";\n    throw e;\n  }\n}\nconsole.log(getUserName([{ id: 1, name: "Ада" }], 1));\nconsole.log(getUserName([{ id: 1, name: "Ада" }], 99))')}

<h2>4. Агрегация ошибок (AggregateError)</h2>
<p>Если нужно собрать несколько ошибок одновременно (например, валидация формы), используйте встроенный ${c('AggregateError')}:</p>
${run('const errors = [];\nif (!"email") errors.push(new Error("email обязателен"));\nerrors.push(new Error("пароль слишком короткий"));\nconst agg = new AggregateError(errors, "Форма невалидна");\nconsole.log(agg.message);\nconsole.log(agg.errors.length);\nconsole.log(agg.errors[0].message)')}

<h2>5. Что писать в message</h2>
<ul>
<li>Кратко и по делу: что произошло и в каких данных.</li>
<li>Не включайте секреты (токены, пароли) в сообщения ошибок.</li>
<li>Дополнительную структуру кладите в поля объекта, а не только в текст.</li>
</ul>
<div class="note"><b>Памятка:</b> собственные классы ошибок делают ${c('catch')} точным — вы можете отличить ${c('ValidationError')} от ${c('NetworkError')} и обработать их по-разному.</div>
<h2>Как читать этот урок</h2><p>Когда видите <code>${c('extends Error')}</code>, обратите внимание на поле <code>${c('name')}</code> и дополнительные свойства. Они нужны, чтобы в catch'е различать типы ошибок через <code>${c('instanceof')}</code>.</p><div class="note"><b>Что должно остаться в голове:</b> Пользовательский error — обычный класс с extends Error; вызывайте super(message); ставьте this.name; передавайте контекст через дополнительные поля.</div>
`,
      task: {
        text: 'Создайте класс AppError extends Error с конструктором (message, code, meta). Поле name должно быть "AppError". Создайте два потомка: InputError (code = "INPUT") и ServerError (code = "SERVER"). Напишите функцию classifyError(err): если err — InputError, верните "bad input"; если ServerError — "retry later"; если другой AppError — err.code ?? "unknown"; если вообще не AppError — "unhandled".',
        starter: 'class AppError extends Error {\n  // ваш код\n}\n\nclass InputError extends AppError {\n  // ваш код\n}\n\nclass ServerError extends AppError {\n  // ваш код\n}\n\nfunction classifyError(err) {\n  // ваш код\n}\n',
        tests: `
test('AppError создаётся с нужными полями', () => { const e = new AppError("oops", "GEN", { x: 1 }); eq(e.message, "oops"); eq(e.code, "GEN"); eq(e.meta, { x: 1 }); eq(e.name, "AppError"); assert(e instanceof Error); });
test('InputError наследует AppError', () => { const e = new InputError("bad"); assert(e instanceof AppError); assert(e instanceof InputError); eq(e.code, "INPUT"); });
test('ServerError наследует AppError', () => { const e = new ServerError("down"); assert(e instanceof AppError); eq(e.code, "SERVER"); });
test('classifyError для InputError', () => eq(classifyError(new InputError("x")), "bad input"));
test('classifyError для ServerError', () => eq(classifyError(new ServerError("y")), "retry later"));
test('classifyError для другого AppError', () => eq(classifyError(new AppError("z", "CUSTOM")), "CUSTOM"));
test('classifyError для обычного Error', () => eq(classifyError(new Error("plain")), "unhandled"));
test('classifyError для null', () => eq(classifyError(null), "unhandled"));
test('stacktrace указывает на потомка', () => { const e = new InputError("test"); assert(typeof e.stack === "string" && e.stack.length > 0, "stack должен присутствовать"); });`,
        hints: [
          'Конструктор AppError: constructor(message, code, meta) { super(message); this.name = "AppError"; this.code = code; this.meta = meta; }',
          'InputError: constructor(message, meta) { super(message, "INPUT", meta); this.name = "InputError"; }. Аналогично ServerError.',
          'classifyError: if (err instanceof InputError) return "bad input"; if (err instanceof ServerError) ... ; if (err instanceof AppError) return err.code ?? "unknown"; return "unhandled";'
        ],
        solution: 'class AppError extends Error {\n  constructor(message, code, meta) {\n    super(message);\n    this.name = "AppError";\n    this.code = code;\n    this.meta = meta;\n  }\n}\nclass InputError extends AppError {\n  constructor(message, meta) {\n    super(message, "INPUT", meta);\n    this.name = "InputError";\n  }\n}\nclass ServerError extends AppError {\n  constructor(message, meta) {\n    super(message, "SERVER", meta);\n    this.name = "ServerError";\n  }\n}\nfunction classifyError(err) {\n  if (err instanceof InputError) return "bad input";\n  if (err instanceof ServerError) return "retry later";\n  if (err instanceof AppError) return err.code ?? "unknown";\n  return "unhandled";\n}'
      }
    },
    {
      id: 'debugging-patterns', t: 'Отладка: guard-условия, ранние возвраты, структурированные коды',
      th: `
<h2>1. Guard-условие (защитная проверка)</h2>
<p><b>Guard</b> — ранняя проверка, которая сразу возвращает результат или бросает ошибку, если данные непригодны. Так тело функции остаётся плоским без глубокой вложенности if:</p>
${run('function parseAge(raw) {\n  if (typeof raw !== "string") return null;\n  const trimmed = raw.trim();\n  if (trimmed === "") return null;\n  const n = Number(trimmed);\n  if (!Number.isInteger(n) || n < 0 || n > 150) return null;\n  return n;\n}\nconsole.log(parseAge("25"));\nconsole.log(parseAge(""));\nconsole.log(parseAge("-1"));\nconsole.log(parseAge("abc"))')}

<h2>2. Ранний возврат vs else</h2>
<p>Вместо ${c('if (ok) { ...много кода... } else { return null; }')} пишите ${c('if (!ok) return null;')} и дальше основной путь. Это уменьшает количество «вложенных лесенок» и облегчает чтение.</p>
${run('function score(arr) {\n  if (!Array.isArray(arr)) return null;\n  if (arr.length === 0) return 0;\n  let sum = 0;\n  for (const v of arr) {\n    if (typeof v !== "number") return null;\n    sum += v;\n  }\n  return sum / arr.length;\n}\nconsole.log(score([1, 2, 3]));\nconsole.log(score([]));\nconsole.log(score(null));\nconsole.log(score([1, "x"]))')}

<h2>3. Структурный подход: коды ошибок вместо текста</h2>
<p>Сравнивать строки сообщений хрупко — опечатка ломает проверку. Надёжнее давать каждой ошибке стабильный короткод и держать его в поле ${c('code')}:</p>
${run('class BizError extends Error {\n  constructor(code, msg) {\n    super(msg);\n    this.name = "BizError";\n    this.code = code;\n  }\n}\nfunction transfer(from, to, amount) {\n  if (amount <= 0) throw new BizError("NON_POSITIVE_AMOUNT", "sum must be > 0");\n  if (from.balance < amount) throw new BizError("INSUFFICIENT_FUNDS", "not enough money");\n  from.balance -= amount;\n  to.balance += amount;\n}\nconst a = { balance: 50 }, b = { balance: 0 };\ntry { transfer(a, b, 100); } catch (e) {\n  console.log(e.code);\n}')}

<h2>4. Assert для внутренних инвариантов</h2>
<p>В браузере ${c('console.assert(cond, msg)')} печатает предупреждение, если cond ложно, но не останавливает выполнение. В песочнице курса его нет — используйте ${c('throw')} или обычный if и смотрите вывод:</p>
${run('function double(x) {\n  if (typeof x !== "number") {\n    console.warn("double ожидает число, получил:", typeof x);\n    return null;\n  }\n  return x * 2;\n}\nconsole.log(double(5));\nconsole.log(double("oops"));')}
<p>В production обычно используют специализированные библиотеки, которые умеют падать, логировать в сервис или собирать telemetry.</p>

<h2>5. Чек-лист отладки</h2>
<ol>
<li>Уточните, воспроизводится ли баг на минимальном входе.</li>
<li>Напечатайте реальные значения в ключевых точках (${c('console.log')}, ${c('console.table')}).</li>
<li>Разбейте большую функцию на маленькие — так легче локализовать.</li>
<li>Пишите тест до исправления: он зафиксирует, что баг ушёл.</li>
</ol>
<div class="note"><b>Золотое правило:</b> сначала напишите тест, который воспроизводит ошибку, потом чините код. Тест станет гарантией, что баг не вернётся.</div>
<h2>Как читать этот урок</h2><p>Guard-условия читаются как список «стоп-факторов». Пока вы не дошли до конца функции, нормальный путь не начинается. Код ошибок стабильнее, чем сравнение сообщений по тексту.</p><div class="note"><b>Что должно остаться в голове:</b> Плоский код с ранними возвратами читается проще; стабилизированные коды ошибок легче проверять; console.assert помогает заметить нарушения инвариантов на этапе разработки.</div>
`,
      task: {
        text: 'Реализуйте функцию processOrder(order) с guard-проверками. order — объект { id, items, total }. Правила (нарушение → верните объект { error: "<КОД>" }): (1) order должен быть объектом (не null, не массив) — INVALID_TYPE; (2) id — непустая строка — MISSING_ID; (3) items — массив длиной ≥ 1 — EMPTY_ITEMS; (4) каждый item должен иметь числовое positive поле price — INVALID_PRICE; (5) total — число равное сумме цен (допуск 0.001) — TOTAL_MISMATCH. Если все проверки пройдены, верните { ok: true, count: <число элементов> }. Исходный order не мутируйте.',
        starter: 'function processOrder(order) {\n  // ваш код\n}\n',
        tests: `
test('корректный заказ', () => eq(processOrder({ id: "A1", items: [{ price: 10 }, { price: 5.5 }], total: 15.5 }), { ok: true, count: 2 }));
test('order=null', () => eq(processOrder(null), { error: "INVALID_TYPE" }));
test('order=[1,2] (массив)', () => eq(processOrder([1, 2]), { error: "INVALID_TYPE" }));
test('id пустая строка', () => eq(processOrder({ id: "", items: [{ price: 1 }], total: 1 }), { error: "MISSING_ID" }));
test('items пустой массив', () => eq(processOrder({ id: "X", items: [], total: 0 }), { error: "EMPTY_ITEMS" }));
test('item с price=0', () => eq(processOrder({ id: "X", items: [{ price: 0 }], total: 0 }), { error: "INVALID_PRICE" }));
test('item с отрицательной ценой', () => eq(processOrder({ id: "X", items: [{ price: -5 }], total: -5 }), { error: "INVALID_PRICE" }));
test('total не сходится', () => eq(processOrder({ id: "X", items: [{ price: 3 }], total: 4 }), { error: "TOTAL_MISMATCH" }));
test('total сходится с допуском', () => eq(processOrder({ id: "X", items: [{ price: 0.1 }, { price: 0.2 }], total: 0.3 }), { ok: true, count: 2 }));
test('order не мутируется', () => { const o = { id: "A", items: [{ price: 1 }], total: 1 }; processOrder(o); eq(o, { id: "A", items: [{ price: 1 }], total: 1 }); });`,
        hints: [
          'Первый guard: if (order === null || typeof order !== "object" || Array.isArray(order)) return { error: "INVALID_TYPE" };',
          'Для items: if (!Array.isArray(order.items) || order.items.length === 0) return { error: "EMPTY_ITEMS" }; Затем цикл по items и проверка typeof item.price === "number" && item.price > 0.',
          'Для суммы: reduce((s, i) => s + i.price, 0). Сравнение с допуском: Math.abs(total - sum) > 0.001.'
        ],
        solution: 'function processOrder(order) {\n  if (order === null || typeof order !== "object" || Array.isArray(order)) {\n    return { error: "INVALID_TYPE" };\n  }\n  if (typeof order.id !== "string" || order.id === "") {\n    return { error: "MISSING_ID" };\n  }\n  if (!Array.isArray(order.items) || order.items.length === 0) {\n    return { error: "EMPTY_ITEMS" };\n  }\n  for (const item of order.items) {\n    if (item === null || typeof item !== "object" || typeof item.price !== "number" || item.price <= 0) {\n      return { error: "INVALID_PRICE" };\n    }\n  }\n  const sum = order.items.reduce((s, i) => s + i.price, 0);\n  if (typeof order.total !== "number" || Math.abs(order.total - sum) > 0.001) {\n    return { error: "TOTAL_MISMATCH" };\n  }\n  return { ok: true, count: order.items.length };\n}'
      }
    }
  ]
};