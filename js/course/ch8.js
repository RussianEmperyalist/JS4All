import { run, c } from './h.js';

export default {
  id: 'regex-modules', title: 'Регулярные выражения и модули',
  lessons: [
    {
      id: 'regex', t: 'Регулярные выражения',
      th: `
<h2>1. Что такое регулярное выражение</h2>
<p><b>Регулярное выражение</b> — это шаблон, по которому JavaScript ищет текст. Оно полезно, когда обычного ${c('includes()')} недостаточно.</p>
${run('const re = /cat/i;\nconsole.log(re.test("My CAT"));')}
<p>${c('/cat/i')} означает: найти последовательность ${c('cat')}, игнорируя регистр.</p>

<h2>2. Создание и флаги</h2>
<p>Регулярное выражение можно записать как литерал или через конструктор ${c('new RegExp("pattern")')}. Литерал компилируется при чтении кода — это быстрее и удобнее.</p>
<p>Флаги:</p>
<ul>
<li>${c('i')} — игнорировать регистр;</li>
<li>${c('g')} — искать все совпадения (не только первое);</li>
<li>${c('m')} — многострочный режим: ${c('^')} и ${c('$')} работают с началом и концом каждой строки.</li>
</ul>
${run('const text = "Cat cat CAT";\nconsole.log(text.match(/cat/gi));\nconsole.log(/cat/i.test("cat"));\nconsole.log(/cat/i.test("dog"))')}

<h2>3. Основные символы и классы</h2>
<div class="tw"><table>
<tr><th>Синтаксис</th><th>Смысл</th></tr>
<tr><td>${c('^')}</td><td>начало строки</td></tr>
<tr><td>${c('$')}</td><td>конец строки</td></tr>
<tr><td>${c('\\d')}</td><td>одна цифра (0-9)</td></tr>
<tr><td>${c('\\D')}</td><td>не цифра</td></tr>
<tr><td>${c('\\w')}</td><td>буква, цифра или _</td></tr>
<tr><td>${c('\\s')}</td><td>пробельный символ</td></tr>
<tr><td>${c('[abc]')}</td><td>один символ из набора</td></tr>
<tr><td>${c('[^abc]')}</td><td>символ НЕ из набора</td></tr>
<tr><td>${c('[a-z]')}</td><td>диапазон символов</td></tr>
</table></div>

<h2>4. Повторы</h2>
<table><tr><th>Синтаксис</th><th>Смысл</th></tr>
<tr><td>${c('*')}</td><td>ноль или больше раз</td></tr>
<tr><td>${c('+')}</td><td>один или больше раз</td></tr>
<tr><td>${c('?')}</td><td>ноль или один раз</td></tr>
<tr><td>${c('{n}')}</td><td>ровно n раз</td></tr>
<tr><td>${c('{n,m}')}</td><td>от n до m раз</td></tr>
</table>
${run('console.log("123abc".match(/\\d+/));\nconsole.log("hello world".match(/\\w+ \\w+/));\nconsole.log("abc".match(/^a.c$/));\nconsole.log("12345".match(/^\\d{3}$/))')}

<h2>5. Поиск, замена и группы</h2>
<p>${c('match')} возвращает массив совпадений, ${c('replace')} заменяет, ${c('test')} проверяет наличие:</p>
${run('const text = "Телефон: +7 900 123-45-67";\nconsole.log(text.replace(/\\s+/g, " "));\nconsole.log(text.match(/\\d+/g))')}
<p>Группы ${c('(...)')} захватывают подстроку для дальнейшей работы.</p>
${run('const email = "user@example.com";\nconst re = /^(\\w+)@(\\w+)\\.(\\w+)$/;\nconst m = email.match(re);\nif (m) console.log(m[1], m[2], m[3])')}

<div class="note"><b>Совет:</b> регулярные выражения не нужно писать огромными сразу. Начните с маленького шаблона и добавляйте ограничения по одному.</div>
<h2>Как читать этот урок</h2><p>Разбирайте шаблон слева направо: якоря начала и конца, наборы символов, повторы и флаги. Обязательно проверьте граничные случаи: пустую строку, пробелы и лишние символы.</p><div class="note"><b>Что должно остаться в голове:</b> Уметь составить простой шаблон, проверить всю строку через test() и объяснить назначение основных метасимволов.</div>
`,
      task: {
        text: 'Напишите функцию isEmail(text): она возвращает true, если строка выглядит как email: до @ — одна или более букв/цифр/точек/подчёркиваний; после @ — одна или более букв/цифр/дефисов, точка и 2-6 букв (домен). Пустая строка — false.',
        starter: 'function isEmail(text) {\n  // ваш код\n}\n',
        tests: `
test('обычный email', () => eq(isEmail('user@example.com'), true));
test('email с точкой', () => eq(isEmail('john.doe@test.org'), true));
test('email с подчёркиванием', () => eq(isEmail('user_name@sub-domain.co'), true));
test('пустая строка', () => eq(isEmail(''), false));
test('без @', () => eq(isEmail('userexample.com'), false));
test('без домена', () => eq(isEmail('@com'), false));
test('несколько @', () => eq(isEmail('a@b@c.com'), false));
test('короткий TLD (1 буква)', () => eq(isEmail('x@a.b'), false));
test('TLD из цифр', () => eq(isEmail('x@a.com1'), false));
test('пробел', () => eq(isEmail('user @test.com'), false));`,
        hints: [
          'Основной шаблон: /^Валидные_символы@валидные_символы.валидные_буквы$/',
          'Используйте ^ и $ чтобы проверить всю строку целиком.',
          'До部分: /[\\w.-]+@[\\w-]+\\.[a-z]{2,6}/i'
        ],
        solution: 'function isEmail(text) {\n  return /^[\\w.]+@[\\w-]+\\.[a-z]{2,6}$/i.test(text);\n}'
      }
    },
    {
      id: 'regex-extract', t: 'Группы, замены и парсинг',
      th: `
<h2>1. Захватывающие группы</h2>
<p>Круглые скобки <code>(...)</code> создают группу: часть совпадения запоминается и доступна отдельно. Результат ${c('match')} содержит полное совпадение (элемент 0) и каждую группу (элементы 1, 2, ...):</p>
${run('const date = "2026-03-15";\nconst m = date.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);\nconsole.log(m[0]);\nconsole.log(m[1], m[2], m[3])')}
<p>Если совпадений нет, ${c('match')} вернёт ${c('null')}.</p>

<h2>2. Заменяющие группы ($1, $2)</h2>
<p>В строке замены можно ссылаться на группы через ${c('$1')}, ${c('$2')} и т.д.:</p>
${run('const name = "Иванов Иван";\nconsole.log(name.replace(/(\\w+) (\\w+)/, "$2, $1"))')}

<h2>3. Замена с функцией</h2>
<p>Второй аргумент ${c('replace')} может быть функцией. Она получает совпадение и группы, и возвращает замену:</p>
${run('const text = "цена: 100 руб, скидка: 20 руб";\nconst result = text.replace(/(\\d+)/g, function(match, num) {\n  return String(Number(num) * 2);\n});\nconsole.log(result)')}

<h2>4. matchAll — все совпадения с группами</h2>
<p>Метод ${c('match')} с флагом g не возвращает группы. Используйте ${c('matchAll')} (он возвращает итератор):</p>
${run('const data = "name=Ada,age=36,name=Maria,age=25";\nconst pairs = [];\nfor (const m of data.matchAll(/(\\w+)=([^,]+)/g)) {\n  pairs.push(m[1] + ":" + m[2]);\n}\nconsole.log(pairs.join(", "))')}

<h2>5. Нежадные повторы</h2>
<p>По умолчанию повторы жадные — захватывают максимум. С ${c('?')} после повторителя — нежадные:</p>
${run('const html = "<b>bold</b> and <i>italic</i>";\nconsole.log(html.match(/<(\\w+)>/)[1]);\nconsole.log(html.match(/<(\\w+?)>/)[1])')}
<p>Жадный <code>\\w+</code> захватит всё до последней <code>></code>, а нежадный <code>\\w+?</code> остановится на первом.</p>

<h2>6. backreference — ссылка на группу внутри шаблона</h2>
${run('const quoted = `"hello" world`; \nconsole.log(quoted.match(/(.)\\1/));\nconst tags = "<p>text</p>";\nconsole.log(tags.match(/<(\\w+)>.*?<\\/\\1>/))')}
<p>${c('\\1')} ссылается на первую группу внутри того же шаблона. Полезно для парных тегов и кавычек.</p>

<div class="note"><b>Практика:</b> составляйте регулярку постепенно. Сначала найдите нужное, потом ограничьте. Всегда проверяйте пустую строку и крайние случаи.</div>
<h2>Как читать этот урок</h2><p>Для replace-функции каждый аргумент — массив: полное совпадение, затем группы, позиция, исходная строка.</p><div class="note"><b>Что должно остаться в голове:</b> Группы захватывают подстроки, replace принимает функцию, matchAll нужен для всех совпадений с группами, \\1 — обратная ссылка.</div>
`,
      task: {
        text: 'Напишите функцию extractNumbers(str): она извлекает из строки все числа (целые и дробные, включая отрицательные), которые окружены текстом или стоят в начале/конце. Возвращает массив чисел. Пример: extractNumbers("цена -3.5 руб, скидка 10%") → [-3.5, 10]. Пустая строка даёт [].',
        starter: 'function extractNumbers(str) {\n  // ваш код\n}\n',
        tests: `
test('два числа', () => eq(extractNumbers('цена 100 руб и 50 коп'), [100, 50]));
test('дроби', () => eq(extractNumbers('температура -3.5 и 2.7'), [-3.5, 2.7]));
test('число в начале', () => eq(extractNumbers('42 is answer'), [42]));
test('число в конце', () => eq(extractNumbers('answer is 42'), [42]));
test('пустая строка', () => eq(extractNumbers(''), []));
test('нет чисел', () => eq(extractNumbers('просто текст'), []));
test('одно число', () => eq(extractNumbers('100'), [100]));
test('минус без дроби', () => eq(extractNumbers('temp -5 deg'), [-5]));`,
        hints: [
          'Шаблон числа: -?\\d+(?:\\.\\d+)?',
          'Используйте matchAll или match с флагом g, затем Number() для преобразования.',
          'Не забудьте, что match возвращает null если совпадений нет.'
        ],
        solution: 'function extractNumbers(str) {\n  const matches = str.match(/-?\\d+(?:\\.\\d+)?/g);\n  return matches ? matches.map(Number) : [];\n}'
      }
    },
    {
      id: 'modules', t: 'Модули: import и export',
      th: `
<h2>1. Зачем модули</h2>
<p>Модуль — это файл, в котором код имеет <b>свою область видимости</b>. Другие файлы не видят его переменных, пока те явно не экспортированы. Это убирает случайные глобальные переменные и делает зависимости видимыми.</p>
<p>Сам курс устроен как набор модулей: каждая глава — отдельный файл, а ${c('course-data.js')} импортирует их все:</p>
${run('console.log("// course-data.js");\nconsole.log("import ch1 from \'./ch1.js\';");\nconsole.log("import ch2 from \'./ch2.js\';");\nconsole.log("export const modules = [ch1, ch2, /* ... */ ];");\nconsole.log("// Имена импортов — как в вашем решении, значит, имена совпадают")')}

<h2>2. Именованный экспорт</h2>
<p>Именованный экспорт выглядит как обычное объявление, к которому добавлено ${c('export')}. Импортировать нужно по тому же имени, но можно переименовать через ${c('as')}:</p>
${run('const registry = {\n  math: { add: (a, b) => a + b, multiply: (a, b) => a * b, default: "math-main" },\n  strings: { upper: s => s.toUpperCase(), default: "string-main" }\n};\nconsole.log(registry.math.add(2, 3));\nconsole.log(registry.math.default);\nconsole.log(registry.strings.upper("привет"))')}
<p>В примере выше ${c('registry.math')} — как пространство имён модуля. Свойство ${c('default')} — как default-экспорт.</p>

<h2>3. Default export</h2>
<p>Каждый модуль может иметь один default-экспорт — «главную» вещь, которую удобно импортировать без фигурных скобок. В реестре это свойство ${c('default')}:</p>
${run('const registry = { math: { default: 42, extra: 1 } };\nconst imported = registry.math.default;\nconsole.log(imported);\nconsole.log("extra не импортирован, но доступен через * as all")')}

<h2>4. Что нельзя сделать в песочнице</h2>
<p>Настоящие ${c('import/export')} нельзя выполнить в Worker — он использует ${c('new Function')}, а не парсер модулей. Но саму идею модуля: <b>интерфейс экспорта</b>, — можно протестировать. Задание имитирует разрешение импорта по имени из реестра модулей.</p>
${run('const mods = { math: { add: (a, b) => a + b } };\nconsole.log("import { add } from \'math\' →", mods.math.add(1, 2));\nconsole.log("import { sub } from \'math\' → SyntaxError: Export not found");')}

<h2>5. Переименование и barrel-экспорты</h2>
<p>Иногда удобно собрать экспорты нескольких модулей в один файл-баррель (barrel). В тестах это выглядит как копия свойств из одного объекта в другой:</p>
${run('const target = {};\nconst source = { a: 1, b: 2 };\nObject.assign(target, source);\nconsole.log(target);')}
<p>Но ${c('Object.assign')} не копирует getter-свойства. Для простых значений она работает как разрешение импортёров.</p>

<div class="note"><b>Связь с реальностью:</b> бандлер (esbuild) идёт по цепочке import/export во время сборки и выплёвывает один файл. В вашем браузере всё уже собрано в ${c('js/bundles/main.js')}</div>
<h2>Как читать этот урок</h2><p>Сначала определите, что файл экспортирует: именованные свойства и default. Затем найдите импортёров. Относительный путь указывает на файл, а не на переменную.</p><div class="note"><b>Что должно остаться в голове:</b> Модуль скрывает внутренности и экспортирует только нужное; именованный import берёт свойство по имени; default-импорт берёт главное значение.</div>
`,
      task: {
        text: 'Напишите функцию importNamed(registry, moduleName, exportName): она имитирует разрешение именованного импорта. registry — объект вида { moduleName: { exportName: value, default: value } }. Функция возвращает запрошенное значение.Если модуль не найден — выбрасывает SyntaxError("Module not found: <moduleName>"). Если экспорт не найден — SyntaxError("Export not found: <exportName> из модуля <moduleName>"). Свойство "default" импортировать нельзя через importNamed — для него отдельный метод. Исходный registry не мутируется.',
        starter: 'function importNamed(registry, moduleName, exportName) {\n  // ваш код\n}\n',
        tests: `
test('именованный экспорт из модуля', () => eq(importNamed({ math: { add: (a, b) => a + b, pi: 3.14 } }, 'math', 'add')(2, 3), 5));
test('именованный экспорт — число', () => eq(importNamed({ config: { host: "localhost", port: 8080 } }, 'config', 'port'), 8080));
test('модуль не найден', () => { let caught = null; try { importNamed({ math: { x: 1 } }, 'strings', 'upper'); } catch (e) { caught = e; } assert(caught instanceof SyntaxError, 'Нужен SyntaxError'); assert(/Module not found/.test(caught.message), 'Сообщение о модуле'); });
test('экспорт не найден', () => { let caught = null; try { importNamed({ math: { add: 1 } }, 'math', 'subtract'); } catch (e) { caught = e; } assert(caught instanceof SyntaxError, 'Нужен SyntaxError'); assert(/Export not found/.test(caught.message), 'Сообщение об экспорте'); });
test('default нельзя импортировать через importNamed', () => { let caught = null; try { importNamed({ math: { default: 42 } }, 'math', 'default'); } catch (e) { caught = e; } assert(caught instanceof SyntaxError, 'default — не именованный экспорт'); });
test('registry не мутируется', () => { const r = { math: { add: 1 } }; importNamed(r, 'math', 'add'); eq(r, { math: { add: 1 } }); });`,
        hints: [
          'Сначала проверьте, есть ли registry[moduleName]. Если нет — SyntaxError("Module not found: " + moduleName).',
          'Затем проверьте exportName === "default" — бросайте SyntaxError, default-экспорт импортируют иначе.',
          'Если exportName нет в модуле — SyntaxError("Export not found: " + exportName + " из модуля " + moduleName).',
          'Возвращайте registry[moduleName][exportName]. Для проверки мутации используйте Object.keys.'
        ],
        solution: 'function importNamed(registry, moduleName, exportName) {\n  if (!(moduleName in registry)) {\n    throw new SyntaxError("Module not found: " + moduleName);\n  }\n  if (exportName === "default") {\n    throw new SyntaxError("Export not found: default из модуля " + moduleName);\n  }\n  const mod = registry[moduleName];\n  if (!(exportName in mod)) {\n    throw new SyntaxError("Export not found: " + exportName + " из модуля " + moduleName);\n  }\n  return mod[exportName];\n}'
      }
    }
  ]
};
