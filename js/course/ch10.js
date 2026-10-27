import { run, c } from './h.js';

export default {
  id: 'browser-node', title: 'JavaScript в браузере и Node.js',
  lessons: [
    {
      id: 'dom-events', t: 'DOM и события',
      th: `
<h2>1. JavaScript управляет страницей</h2>
<p>В браузере HTML превращается в дерево объектов — <b>DOM</b> (Document Object Model). JavaScript может находить эти объекты, читать их свойства и изменять страницу.</p>
<p><code>document</code> — объект текущей страницы. <code>querySelector()</code> ищет первый элемент по CSS-селектору, <code>querySelectorAll()</code> возвращает все совпадения.</p>
${run('const fakeEl = { tagName: "DIV", textContent: "привет", classList: ["box"] };\nconsole.log(fakeEl.tagName);\nconsole.log(fakeEl.textContent)')}

<h2>2. Изменение элемента</h2>
<p>У DOM-элемента много полезных свойств:</p>
<ul>
<li>${c('textContent')} — текст внутри элемента (без HTML);</li>
<li>${c('innerHTML')} — содержимое как HTML-строка;</li>
<li>${c('classList')} — набор CSS-классов с методами ${c('add')}, ${c('remove')}, ${c('toggle')}, ${c('contains')};</li>
<li>${c('style')} — встроенные стили;</li>
<li>${c('value')} — значение поля формы.</li>
</ul>
${run('const el = { textContent: "", classes: new Set(), style: {} };\nel.textContent = "Важно!";\nel.classes.add("highlight");\nel.style.color = "red";\nconsole.log(el.textContent, [...el.classes])')}

<h2>3. События</h2>
<p>Событие сообщает JavaScript, что произошло действие: клик, нажатие клавиши, отправка формы. Подписка — через ${c('addEventListener')}:</p>
${run('let clicks = 0;\nfunction handleClick() { clicks++; }\nhandleClick(); handleClick(); handleClick();\nconsole.log("кликов:", clicks)')}
<p>${c('event.target')} — элемент, на котором произошло событие. ${c('event.preventDefault()')} отменяет стандартное поведение браузера.</p>

<h2>4. Как работает DOM-песочница JS 4All</h2>
<p>Для уроков про DOM курс создаёт изолированный iframe с ${c('sandbox="allow-scripts"')}. Ваш код запускается внутри iframe, а тесты проверяют реальное состояние страницы. Вы можете создавать элементы, менять текст и вешать обработчики — всё это будет честно выполнено.</p>

<div class="note"><b>Связь с проектом:</b> интерфейс JS 4All тоже использует DOM, обработчики событий и JavaScript для переключения уроков и запуска редактора.</div>
<h2>Как читать этот урок</h2><p>Сначала найдите нужный элемент, затем измените его свойство или подпишитесь на событие. Проверяйте, что элемент найден, прежде чем обращаться к его свойствам.</p><div class="note"><b>Что должно остаться в голове:</b> Уметь найти DOM-элемент, изменить его содержимое и повесить обработчик события.</div>
`,
      task: {
        text: 'На странице уже есть кнопка с id="btn" и текстом "Старт". Замените её текст на "Нажми", а при клике — на "Готово!" и добавьте класс "done".',
        starter: '// Доступен document.querySelector("#btn")\n',
        domHtml: '<button id="btn">Старт</button>',
        tests: `
test('кнопка существует', () => { const b = document.querySelector('#btn'); assert(b !== null, 'Кнопка #btn не найдена'); });
test('текст изменён на "Нажми"', () => { const b = document.querySelector('#btn'); eq(b.textContent, 'Нажми'); });
test('после клика текст "Готово!"', () => { const b = document.querySelector('#btn'); b.click(); eq(b.textContent, 'Готово!'); });
test('после клика добавлен класс done', () => { const b = document.querySelector('#btn'); b.click(); assert(b.classList.contains('done'), 'Класс done не добавлен'); });`,
        hints: ['Найдите кнопку: const btn = document.querySelector("#btn");', 'Замените текст: btn.textContent = "Нажми";', 'Повесьте обработчик: btn.addEventListener("click", () => { btn.textContent = "Готово!"; btn.classList.add("done"); });'],
        solution: 'const btn = document.querySelector("#btn");\nbtn.textContent = "Нажми";\nbtn.addEventListener("click", () => {\n  btn.textContent = "Готово!";\n  btn.classList.add("done");\n});'
      }
    },
    {
      id: 'http-fetch', t: 'HTTP, fetch и формы',
      th: `
<h2>1. HTTP-методы</h2>
<p><b>HTTP</b> — протокол запросов к серверу. Основные методы:</p>
<ul>
<li><b>GET</b> — получить данные;</li>
<li><b>POST</b> — создать/отправить;</li>
<li><b>PUT/PATCH</b> — изменить;</li>
<li><b>DELETE</b> — удалить.</li>
</ul>

<h2>2. fetch возвращает Promise</h2>
<p>${c('fetch()')} начинает асинхронный запрос и сразу возвращает ${c('Promise')}. Результат обрабатывают через ${c('await')} или ${c('.then()')}:</p>
${run('async function load() {\n  const response = await fetch("/api/user");\n  console.log("статус:", response.status);\n  return response;\n}\nconsole.log("fetch начал работу, код продолжает выполнение");')}

<h2>3. Важный подвох: fetch не падает на 404</h2>
<p>HTTP-ошибка 404 или 500 <b>не отклоняет</b> Promise. Promise разрешается успешно — нужно самостоятельно проверять ${c('response.ok')}:</p>
${run('const okResp = { ok: true, status: 200 };\nconst errResp = { ok: false, status: 404 };\nconsole.log("200: ok=", okResp.ok, "status=", okResp.status);\nconsole.log("404: ok=", errResp.ok, "status=", errResp.status)')}

<h2>4. Чтение тела ответа</h2>
<p>Тело ответа нужно распарсить: ${c('response.json()')} для JSON, ${c('response.text()')} для текста. Оба возвращают Promise:</p>
${run('const body = JSON.stringify({ name: "Ада", year: 1815 });\nconsole.log(body);\nconst parsed = JSON.parse(body);\nconsole.log(parsed.name)')}

<h2>5. Формы и preventDefault</h2>
<p>У формы событие ${c('submit')}. Если JavaScript отправляет данные, вызовите ${c('event.preventDefault()')}, чтобы отменить перезагрузку страницы:</p>
${run('let submitted = false;\nfunction handleSubmit(e) { e.preventDefault(); submitted = true; }\nconst fakeEvent = { preventDefault() {} };\nhandleSubmit(fakeEvent);\nconsole.log("перехвачено:", submitted)')}

<div class="note"><b>Паттерн:</b> всегда проверяйте response.ok перед чтением тела. Сетевые ошибки (отсутствие соединения) realy отклоняют Promise, а HTTP-коды ошибок — нет.</div>
<h2>Как читать этот урок</h2><p>Разделяйте три случая: сетевая ошибка (Promise rejected), HTTP-ошибка (ok === false), ошибка парсинга тела. Проверяйте response.ok перед чтением json().</p><div class="note"><b>Что должно остаться в голове:</b> fetch возвращает Promise; проверяйте response.ok; тело читают через await response.json().</div>
`,
      task: {
        text: 'Напишите async-функцию extractData(response): она принимает объект с полями { ok, status, json } (json — функция, возвращающая Promise). Если ok === true, вызывает await response.json() и возвращает { ok, status, data }. Если ok === false — выбрасывает Error("HTTP " + status). Не мутируйте response.',
        starter: 'async function extractData(response) {\n  // ваш код\n}\n',
        tests: `
test('успешный ответ с данными', async () => {
  const resp = { ok: true, status: 200, json: () => Promise.resolve({ name: "Ада" }) };
  eq(await extractData(resp), { ok: true, status: 200, data: { name: "Ада" } });
});
test('HTTP-ошибка бросает исключение', async () => {
  const resp = { ok: false, status: 404, json: () => Promise.resolve({}) };
  let caught = null;
  try { await extractData(resp); } catch (e) { caught = e; }
  assert(caught instanceof Error, 'Нужно выбросить Error');
  eq(caught.message, 'HTTP 404');
});
test('json() вызывается только при ok=true', async () => {
  let jsonCalled = false;
  const resp = { ok: true, status: 200, json: () => { jsonCalled = true; return Promise.resolve(null); } };
  await extractData(resp);
  assert(jsonCalled, 'json() должен быть вызван');
});
test('json() не вызывается при ok=false', async () => {
  let jsonCalled = false;
  const resp = { ok: false, status: 500, json: () => { jsonCalled = true; return Promise.resolve({}); } };
  try { await extractData(resp); } catch {}
  assert(!jsonCalled, 'json() не должен вызываться при ошибке');
});
test('response не мутируется', async () => {
  const resp = { ok: true, status: 200, json: () => Promise.resolve(1) };
  await extractData(resp);
  eq(resp, { ok: true, status: 200, json: resp.json });
});
test('пустые данные при успехе', async () => {
  const resp = { ok: true, status: 200, json: () => Promise.resolve(null) };
  eq(await extractData(resp), { ok: true, status: 200, data: null });
});`,
        hints: [
          'Сначала проверьте response.ok. Если false — throw new Error("HTTP " + response.status).',
          'Если true — const data = await response.json(); return { ok: response.ok, status: response.status, data };',
          'Не модифицируйте response: просто читайте его свойства и вызывайте json().'
        ],
        solution: 'async function extractData(response) {\n  if (!response.ok) {\n    throw new Error("HTTP " + response.status);\n  }\n  const data = await response.json();\n  return { ok: response.ok, status: response.status, data };\n}'
      }
    },
    {
      id: 'canvas', t: 'Canvas: рисуем на холсте',
      th: `
<h2>1. Получение контекста</h2>
<p>Элемент ${c('<canvas>')} определяет область для рисования. Чтобы рисовать, запрашивают <b>контекст</b> — объект с методами и свойствами:</p>
${run('const fakeCanvas = { width: 300, height: 200, getContext(type) {\n  return { type, fillStyle: "#000", ops: [] };\n} };\nconst ctx = fakeCanvas.getContext("2d");\nconsole.log(ctx.type);\nconsole.log(ctx.fillStyle)')}

<h2>2. fillRect — закрашенный прямоугольник</h2>
<p>${c('ctx.fillRect(x, y, w, h)')} рисует закрашенный прямоугольник. Координаты: ${c('x')} — слева направо, ${c('y')} — сверху вниз, ${c('0, 0')} — левый верхний угол:</p>
${run('const ctx = { ops: [] };\nctx.fillRect = function(x, y, w, h) { this.ops.push("fillRect(" + x + "," + y + "," + w + "," + h + ")"); };\nctx.fillRect(10, 20, 30, 40);\nconsole.log(ctx.ops.join("; "))')}

<h2>3. Цвет заливки</h2>
<p>Свойство ${c('fillStyle')} задаёт цвет следующего ${c('fillRect')}. Значения как в CSS: ${c('"red"')}, ${c('"#ff0000"')}, ${c('"rgb(255,0,0)"')}:</p>
${run('const ctx = { ops: [], color: "" };\nctx.fillRect = function() { this.ops.push(this.color); };\nctx.fillStyle = "red";\nctx.fillRect();\nconsole.log(ctx.ops)')}

<h2>4. Очистка и clearRect</h2>
<p>${c('ctx.clearRect(x, y, w, h)')} очищает прямоугольную область холста. Чтобы очистить всё, используют размеры canvas:</p>
${run('const ops = ["fillRect(0,0,100,100)", "clearRect(0,0,200,100)", "fillRect(10,10,30,30)"];\nconsole.log(ops.join(" → "))')}

<h2>5. Анимация через очистку</h2>
<p>Для анимации рисуют кадр, ждут, очищают и рисуют следующий. Очистка нужна, чтобы старое изображение не осталось:</p>
${run('const frames = [];\nfor (let i = 0; i < 3; i++) {\n  frames.push("clear", "fillRect(" + i + "," + i + ",10,10)");\n}\nconsole.log(frames.join(" "))')}

<div class="note"><b>Практика:</b> всегда получайте контекст один раз и переиспользуйте его. clearRect перед перерисовкой предотвращает наложение старых кадров.</div>
<h2>Как читать этот урок</h2><p>Координаты растут вправо (x) и вниз (y). fillRect рисует закрашенный прямоугольник, fillStyle задаёт цвет перед ним, clearRect очищает.</p><div class="note"><b>Что должно остаться в голове:</b> Получить контекст через getContext("2d"); fillRect(x,y,w,h) рисует; fillStyle задаёт цвет; clearRect очищает.</div>
`,
      task: {
        text: 'На холсте canvas есть id="c". Ваш код должен: получить 2D-контекст, установить fillStyle в "red", и нарисовать закрашенный прямоугольник fillRect(10, 20, 30, 40).',
        starter: 'const canvas = document.getElementById("c");\n// ваш код\n',
        domHtml: '<canvas id="c" width="300" height="200"></canvas>\n<script>(function(){var cv=document.getElementById("c");var ctx=cv.getContext("2d");ctx._calls=[];var orig=ctx.fillRect.bind(ctx);ctx.fillRect=function(x,y,w,h){ctx._calls.push({method:"fillRect",args:[x,y,w,h]});return orig(x,y,w,h);};})();</script>',
        tests: `
test('fillRect вызван с правильными аргументами', () => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  const calls = ctx._calls.filter(c => c.method === 'fillRect');
  assert(calls.length >= 1, 'fillRect должен быть вызван');
  const fillCall = calls[calls.length - 1];
  eq(fillCall.args, [10, 20, 30, 40]);
});
test('fillStyle установлен в red', () => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  eq(ctx.fillStyle, 'red');
});
test('контекст получен через getContext', () => {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  assert(ctx !== null, 'Контекст не должен быть null');
  assert(typeof ctx.fillRect === 'function', 'fillRect должен быть функцией');
});
test('canvas найден по id', () => {
  const cv = document.getElementById('c');
  assert(cv !== null, 'canvas не найден');
  eq(cv.width, 300);
});`,
        hints: [
          'Получите canvas: const canvas = document.getElementById("c");',
          'Получите контекст: const ctx = canvas.getContext("2d");',
          'Установите цвет и нарисуйте: ctx.fillStyle = "red"; ctx.fillRect(10, 20, 30, 40);'
        ],
        solution: 'const canvas = document.getElementById("c");\nconst ctx = canvas.getContext("2d");\nctx.fillStyle = "red";\nctx.fillRect(10, 20, 30, 40);'
      }
    },
    {
      id: 'node-env', t: 'Node.js: процесс и переменные окружения',
      th: `
<h2>1. Node.js — это не браузер</h2>
<p><b>Node.js</b> запускает JavaScript вне страницы: в терминале, сервере или скрипте. Здесь нет ${c('document')} и ${c('window')}, но есть доступ к файловой системе, процессу и сети.</p>
${run('console.log("// В браузере:");\nconsole.log("document, window, localStorage");\nconsole.log("// В Node.js:");\nconsole.log("process, fs, path, require")')}

<h2>2. process.env</h2>
<p>В Node.js переменные окружения доступны через ${c('process.env')}: это плоский объект, где все значения строки. Часто env-переменные приходят как текст из файла:</p>
${run('const envText = "NODE_ENV=production\\nPORT=3000\\nDEBUG=true";\nconst parsed = {};\nfor (const line of envText.split("\\n")) {\n  const [key, val] = line.split("=");\n  parsed[key] = val;\n}\nconsole.log(parsed)')}

<h2>3. process.argv</h2>
<p>${c('process.argv')} — массив аргументов командной строки. Первым идёт путь к node, вторым — к скрипту, остальные — параметры:</p>
${run('const argv = ["/usr/bin/node", "script.js", "--name", "Ada", "--port", "3000"];\nconsole.log("скрипт:", argv[1]);\nconsole.log("параметры:", argv.slice(2))')}

<h2>4. CommonJS vs ES-модули</h2>
<p>Старый способ — ${c('require()')} и ${c('module.exports')}. Новый — ${c('import/export')} (когда в package.json ${c('"type": "module"')}):</p>
${run('console.log("// CommonJS:");\nconsole.log("const fs = require(\\"fs\\");\\nconst data = fs.readFileSync(\\"file.txt\\", \\"utf8\\");");\nconsole.log("// ES-модули:");\nconsole.log("import fs from \\"node:fs/promises\\";\\nconst data = await fs.readFile(\\"file.txt\\", \\"utf8\\");")')}

<h2>5. Когда что использовать</h2>
<p>Node.js: скрипты сборки, серверы, CLI-утилиты. Браузер: интерфейсы, события, рисование. Оба используют один язык, но разные API.</p>
${run('console.log("В курсе JS 4All: всё, что вы пишете в песочнице, работает в обоих местах — синтаксис один.")')}

<div class="note"><b>Важно:</b> API среды выполнения не переносимы между браузером и Node. Не вызывайте fetch в старом Node, не используйте document в Node.js без браузерного API.</div>
<h2>Как читать этот урок</h2><p>Определите среду: в браузере — DOM и fetch, в Node.js — process, fs, path. Всегда смотрите, какие API доступны.</p><div class="note"><b>Что должно остаться в голове:</b> Node.js — отдельная среда без DOM; process.env и process.argv для конфигурации; CommonJS через require, ES — через import.</div>
`,
      task: {
        text: 'Напишите функцию parseEnv(text): она разбирает строку переменных окружения формата "KEY=value", разделённую переводами строк. Должна возвращать объект { KEY: "value" }. Пропускайте пустые строки и строки без "=". Если "=" есть несколько, разделяйте только по первому. Все значения — строки.',
        starter: 'function parseEnv(text) {\n  // ваш код\n}\n',
        tests: `
test('два переменных', () => eq(parseEnv('NODE_ENV=production\\nPORT=3000'), { NODE_ENV: 'production', PORT: '3000' }));
test('значение с дополнительным =', () => eq(parseEnv('URL=http://localhost'), { URL: 'http://localhost' }));
test('пустая строка', () => eq(parseEnv(''), {}));
test('строки без = пропускаются', () => eq(parseEnv('NODE_ENV=prod\\ninvalid\\nDEBUG=true'), { NODE_ENV: 'prod', DEBUG: 'true' }));
test('пустое значение', () => eq(parseEnv('KEY='), { KEY: '' }));
test('перевод строки в конце', () => eq(parseEnv('A=1\\n'), { A: '1' }));
test('не мутирует входную строку', () => { const t = 'A=1'; parseEnv(t); eq(t, 'A=1'); });`,
        hints: [
          'Разбейте text на строки: text.split("\\n").',
          'Для каждой строки найдите первый "=". Если нет "=" — пропустите.',
          'Используйте indexOf("=") и slice, чтобы разделить по первому знаку =. Обрезайте пустые строки.'
        ],
         solution: 'function parseEnv(text) {\n  const result = {};\n  for (const line of text.split("\\n")) {\n    const idx = line.indexOf("=");\n    if (idx === -1) continue;\n    const key = line.slice(0, idx);\n    const val = line.slice(idx + 1);\n    if (key !== "") result[key] = val;\n  }\n  return result;\n}'
       }
     },
     {
      id: 'mini-todo', t: 'Мини-проект: список задач',
      th: `
<h2>1. Что делает приложение</h2>
<p>Это мини-проект, объединяющий DOM, события и массивы. Приложение управляется списком задач: вводите текст, нажимаете кнопку — задача появляется в списке.</p>
<p>Основные операции DOM, которые вам понадобятся:</p>
<ul>
<li>${c('document.getElementById(id)')} или ${c('querySelector')} — найти элемент;</li>
<li>${c('el.addEventListener("click", fn)')} — подписаться на клик;</li>
<li>${c('input.value')} — прочитать текст из поля;</li>
<li>${c('document.createElement(tag)')} — создать элемент;</li>
<li>${c('parent.appendChild(el)')} — добавить элемент в DOM;</li>
<li>${c('arr.map(fn)')}, ${c('arr.filter(fn)')} — работа с массивом.</li>
</ul>

<h2>2. Как хранить задачи</h2>
<p>В реальном приложении задачи хранятся в массиве объектов. Каждая задача — это ${c('{ id, text, done }')}. Добавление — это ${c('push')}, удаление — это ${c('filter')}, переключение статуса — это ${c('map')} или прямое изменение свойства:</p>
${run('const todos = [];\ntodos.push({ id: 1, text: "Купить хлеб", done: false });\ntodos.push({ id: 2, text: "Прочитать книгу", done: true });\nconsole.log(todos.length);\nconsole.log(todos[0].text);\nconst active = todos.filter(t => !t.done);\nconsole.log(active.length, "активных");')}

<h2>3. Рендеринг списка</h2>
<p>Когда задачи изменяются, список на странице нужно перерисовать. Самый простой способ: очистить контейнер и добавить все задачи заново через ${c('appendChild')}:</p>
${run('const root = { _children: [], appendChild(el) { this._children.push(el); } };\n["A", "B"].forEach(t => {\n  const li = { textContent: t };\n  root.appendChild(li);\n});\nconsole.log("элементов в списке:", root._children.length);')}

<h2>4. Событие отправки формы</h2>
<p>Кнопка ${c('type="submit"')} в форме генерирует событие ${c('submit')}. Чтобы отменить перезагрузку страницы при нажатии, используйте ${c('event.preventDefault()')}:</p>
${run('let ok = false;\nfunction handler(e) {\n  e.preventDefault();\n  ok = true;\n}\nconst ev = { preventDefault() {} };\nhandler(ev);\nconsole.log("отправлено без перезагрузки:", ok);')}'}

<h2>5. Интерактивность через классы CSS</h2>
<p>Чтобы отметить выполненную задачу, добавьте класс через ${c('classList.add')} или измените ${c('style.textDecoration')}. Состояние переключается через ${c('classList.toggle')}:</p>
${run('const el = { classList: { _set: new Set(), contains(c) { return this._set.has(c); }, add(c) { this._set.add(c); }, toggle(c) { if (this._set.has(c)) this._set.delete(c); else this._set.add(c); } } };\nel.classList.toggle("done");\nconsole.log("done:", el.classList.contains("done"));\nel.classList.toggle("done");\nconsole.log("done:", el.classList.contains("done"))')}

<div class="note"><b>Мини-проект:</b> вы связываете вместе DOM, события, массивы и состояние. Это фундамент любого интерактивного веб-приложения.</div>
<h2>Как читать этот урок</h2><p>Сначала спроектируйте состояние (массив задач). Затем: ввод → добавление в массив → перерисовка. События связывают ввод с логикой.</p><div class="note"><b>Что должно остаться в голове:</b> DOM-элемент найдёте через querySelector; чтобы добавить задачу — создайте li и appendChild; используйте filter/map для изменения массива; preventDefault отменяет отправку формы.</div>
`,
      task: {
        text: 'На странице есть <input id="new-todo" type="text"> и <ul id="list">. Напишите код: при клике на кнопку #add текст из input добавляется как новый <li> в список. Пустой ввод (только пробелы) не добавляется. После добавления input очищается.',
        starter: '// Доступен document.querySelector, input, button и список\n',
        domHtml: '<input id="new-todo" type="text" placeholder="Новая задача"><button id="add">Добавить</button><ul id="list"></ul>',
        tests: `
test('добавление задачи', () => {
  const input = document.querySelector('#new-todo');
  input.value = 'Купить хлеб';
  document.querySelector('#add').click();
  const items = document.querySelectorAll('#list li');
  eq(items.length, 1);
  eq(items[0].textContent, 'Купить хлеб');
});
test('добавление второй задачи', () => {
  const input = document.querySelector('#new-todo');
  input.value = 'Прочитать';
  document.querySelector('#add').click();
  eq(document.querySelectorAll('#list li').length, 2);
});
test('пустой ввод не добавляется', () => {
  const input = document.querySelector('#new-todo');
  input.value = '   ';
  document.querySelector('#add').click();
  eq(document.querySelectorAll('#list li').length, 2);
});
test('input очищается после добавления', () => {
  const input = document.querySelector('#new-todo');
  input.value = 'Тест';
  document.querySelector('#add').click();
  eq(input.value, '');
});`,
        hints: [
          'Найдите элементы: const input = document.querySelector("#new-todo"); const btn = document.querySelector("#add"); const list = document.querySelector("#list");',
          'В обработчике: const text = input.value.trim(); if (text === "") return; создайте li через document.createElement("li"); задайте textContent и appendChild в list.',
          'После добавления: input.value = "";'
        ],
        solution: 'const input = document.querySelector("#new-todo");\nconst btn = document.querySelector("#add");\nconst list = document.querySelector("#list");\nbtn.addEventListener("click", () => {\n  const text = input.value.trim();\n  if (text === "") return;\n  const li = document.createElement("li");\n  li.textContent = text;\n  list.appendChild(li);\n  input.value = "";\n});'
      }
    },
    {
      id: 'mini-stats', t: 'Мини-проект: статистика',
      th: `
<h2>1. Статистика — это сводка данных</h2>
<p>Когда у вас есть массив чисел, часто нужно ответить: какое минимальное, максимальное, среднее значение, медиана. Это фундаментальные операции анализа данных.</p>
${run('const data = [1, 2, 3, 4, 5];\nconsole.log("min:", Math.min(...data));\nconsole.log("max:", Math.max(...data));\nconst sum = data.reduce((a, b) => a + b, 0);\nconsole.log("mean:", sum / data.length);')}

<h2>2. Медиана — это середина</h2>
<p><b>Медиана</b> — значение, которое делит упорядоченный массив пополам. Если количество элементов нечётно — это средний элемент. Если чётно — среднее двух средних:</p>
${run('const even = [1, 2, 3, 4];\nconst sorted = [...even].sort((a, b) => a - b);\nconst mid = Math.floor(sorted.length / 2);\nconst median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];\nconsole.log(median);')}

<h2>3. Проверка входных данных</h2>
<p>Прежде чем вычислять, проверьте: массив пуст? Содержит не только числа? Хорошая функция даёт осмысленную ошибку на плохом входе, а не падение через 10 строк:</p>
${run('function stats(data) {\n  if (!Array.isArray(data)) throw new TypeError("Массив ожидался");\n  if (data.length === 0) return { min: null, max: null, mean: null, median: null, count: 0 };\n  if (!data.every(x => typeof x === "number" && !Number.isNaN(x))) throw new TypeError("Все элементы должны быть числами");\n  const sorted = [...data].sort((a, b) => a - b);\n  const sum = data.reduce((a, b) => a + b, 0);\n  const mid = Math.floor(sorted.length / 2);\n  const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;\n  return { min: sorted[0], max: sorted[sorted.length - 1], mean: sum / data.length, median, count: data.length };\n}\nconsole.log(stats([5, 1, 3]));\nconsole.log(stats([]))')}

<h2>4. Не мутируйте входные данные</h2>
<p><b>sort</b> изменяет массив на месте! Чтобы не менять исходник, сначала копируйте через spread:</p>
${run('const original = [3, 1, 2];\nconst copy = [...original].sort((a, b) => a - b);\nconsole.log("оригинал:", original);\nconsole.log("копия:", copy)')}

<h2>5. Где это используется</h2>
<p>Статистика — основа аналитики: отчёты по продажам, результаты тестов, метрики сайта. Знание min/max/mean/median помогает быстро понять данные и обнаружить выбросы.</p>
<div class="note"><b>Важно:</b> сортировка чисел нуждается в функции сравнения (a, b) => a - b. Без неё [10, 1, 2].sort() даст [1, 10, 2].</div>
<h2>Как читать этот урок</h2><p>Сначала определите: что делает функция (минимум, максимум, среднее), затем найдите данные для расчёта. Для медианы сначала сортируйте копию массива.</p><div class="note"><b>Что должно остаться в голове:</b> Math.min/max ищают экстремумы; reduce считает сумму; медиана нуждается в сортировке; sort меняет массив — копируйте через spread.</div>
`,
      task: {
        text: 'Напишите функцию stats(data): она принимает массив чисел и возвращает { min, max, mean, median, count }. Если массив пуст — все поля null, count = 0. Исходный массив не мутируется.',
        starter: 'function stats(data) {\n  // ваш код\n}\n',
        tests: `
test('обычный массив', () => eq(stats([1, 2, 3, 4, 5]), { min: 1, max: 5, mean: 3, median: 3, count: 5 }));
test('медиана для чётного количества', () => eq(stats([1, 2, 3, 4]), { min: 1, max: 4, mean: 2.5, median: 2.5, count: 4 }));
test('один элемент', () => eq(stats([42]), { min: 42, max: 42, mean: 42, median: 42, count: 1 }));
test('пустой массив', () => eq(stats([]), { min: null, max: null, mean: null, median: null, count: 0 }));
test('отрицательные числа', () => eq(stats([-5, 0, 5]), { min: -5, max: 5, mean: 0, median: 0, count: 3 }));
test('не мутирует исходный массив', () => { const d = [3, 1, 2]; stats(d); eq(d, [3, 1, 2]); });
test('большой массив', () => { const d = [10, 20, 30, 40, 50, 60]; const r = stats(d); eq(r.median, 35); });`,
        hints: [
          'Для пустого массива возвращайте { min: null, max: null, mean: null, median: null, count: 0 }.',
          'Скопируйте для сортировки: [...data].sort((a, b) => a - b).',
          'Медиана: для нечётного количества — средний элемент; для чётного — среднее двух средних.'
        ],
        solution: 'function stats(data) {\n  if (data.length === 0) return { min: null, max: null, mean: null, median: null, count: 0 };\n  const sorted = [...data].sort((a, b) => a - b);\n  const sum = data.reduce((a, b) => a + b, 0);\n  const mid = Math.floor(sorted.length / 2);\n  const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;\n  return { min: sorted[0], max: sorted[sorted.length - 1], mean: sum / data.length, median, count: data.length };\n}'
      }
     }
   ]
};
