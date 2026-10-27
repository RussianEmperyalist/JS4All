import { run, c } from './h.js';

export default {
  id: 'data', title: 'Массивы и объекты',
  lessons: [
    {
      id: 'arrays', t: 'Массивы',
      th: `
<p><b>Массив</b> — упорядоченный список значений. Создаётся квадратными скобками, элементы нумеруются с нуля:</p>
${run('const fruits = ["яблоко", "груша", "слива"];\nconsole.log(fruits.length);\nconsole.log(fruits[0]);\nconsole.log(fruits[fruits.length - 1])')}
<p>Основные действия:</p>
<div class="tw"><table>
<tr><th>Метод</th><th>Что делает</th></tr>
<tr><td>${c('push(x)')} / ${c('pop()')}</td><td>добавить в конец / убрать с конца</td></tr>
<tr><td>${c('unshift(x)')} / ${c('shift()')}</td><td>добавить в начало / убрать с начала</td></tr>
<tr><td>${c('includes(x)')}, ${c('indexOf(x)')}</td><td>есть ли элемент; его номер (-1, если нет)</td></tr>
<tr><td>${c('slice(от, до)')}</td><td>новый массив-копия части (исходный не меняется)</td></tr>
<tr><td>${c('join(", ")')}</td><td>склеить элементы в строку</td></tr>
</table></div>
${run('const list = [1, 2, 3];\nlist.push(4);\nlist.unshift(0);\nconsole.log(list);\nconsole.log(list.slice(1, 3));\nconsole.log(list.join("-"))')}
<p><b>Деструктуризация</b> достаёт элементы в переменные одним действием, а <b>spread</b> ${c('...')} разворачивает массив в другой:</p>
${run('const [first, second, ...rest] = [10, 20, 30, 40];\nconsole.log(first, second, rest);\nconst joined = [...rest, 50];\nconsole.log(joined)')}
<p>Перебор: ${c('for (const item of array)')} для значений или обычный ${c('for')} с номером.</p>
<h2>Как читать этот урок</h2><p>Для массива сначала определите индекс элемента, затем действие: добавить, удалить, найти, получить часть или перебрать.</p><div class="note"><b>Что должно остаться в голове:</b> Вы должны уверенно работать с индексами, <code>length</code>, </code>push</code>, </code>slice</code> и </code>for...of</code>.</div>
`,
      task: {
        text: 'Напишите функцию range(start, end, step = 1): она возвращает массив чисел от start до end включительно с шагом step. Шаг может быть отрицательным: range(5, 2, -1) даёт [5, 4, 3, 2].',
        starter: 'function range(start, end, step = 1) {\n  const result = [];\n  // ваш код\n  return result;\n}\n',
        tests: `
test('range(1, 5)', () => eq(range(1, 5), [1, 2, 3, 4, 5]));
test('с шагом', () => eq(range(0, 10, 3), [0, 3, 6, 9]));
test('отрицательный шаг', () => eq(range(5, 2, -1), [5, 4, 3, 2]));
test('один элемент', () => eq(range(3, 3), [3]));
test('пустой результат', () => eq(range(5, 1), []));`,
        hints: ['Для шага вверх: цикл идёт, пока i <= end; для шага вниз — пока i >= end.', 'Условие: step > 0 ? i <= end : i >= end. Добавляйте в массив через push.'],
        solution: 'function range(start, end, step = 1) {\n  const result = [];\n  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {\n    result.push(i);\n  }\n  return result;\n}'
      }
    },
    {
      id: 'objects', t: 'Объекты',
      th: `
<p><b>Объект</b> — набор пар «ключ: значение». Если массив — нумерованный список, то объект — карточка с подписанными полями:</p>
${run('const cat = {\n  name: "Мурка",\n  age: 3,\n  tags: ["пушистая", "рыжая"]\n};\nconsole.log(cat.name);\nconsole.log(cat["age"]);\ncat.age = 4;\ncat.color = "рыжий";\nconsole.log(cat)')}
<p>Обращаться к свойству можно через точку ${c('cat.name')} или через скобки ${c('cat["name"]')}. Скобки нужны, когда имя лежит в переменной: ${c('cat[key]')}.</p>
<ul>
<li>${c('delete cat.age')} удаляет свойство; ${c('"age" in cat')} проверяет, есть ли оно;</li>
<li>${c('Object.keys(obj)')} — массив ключей, ${c('Object.values(obj)')} — значений, ${c('Object.entries(obj)')} — пар [ключ, значение];</li>
<li>${c('obj?.a?.b')} — <b>необязательная цепочка</b>: если где-то по пути ${c('undefined')}, вернёт ${c('undefined')} вместо ошибки.</li>
</ul>
${run('const user = { name: "Ада", address: { city: "Лондон" } };\nconsole.log(user.address?.city);\nconsole.log(user.contacts?.email);\nconsole.log(Object.entries({ a: 1, b: 2 }))')}
<p><b>Объекты — это ссылки.</b> Две переменные могут указывать на один и тот же объект, и изменение через одну видно через другую:</p>
${run('const a = { n: 1 };\nconst b = a;\nb.n = 99;\nconsole.log(a.n);\nconst copy = { ...a };\ncopy.n = 5;\nconsole.log(a.n)')}
<p>Копию делают через spread ${c('{ ...a }')}. Деструктуризация достаёт свойства в переменные: ${c('const { name, age } = cat')}.</p>
<p>Функция внутри объекта называется <b>методом</b>; ключевое слово ${c('this')} в ней указывает на сам объект:</p>
${run('const dog = {\n  name: "Рекс",\n  speak() {\n    return this.name + " говорит гав";\n  }\n};\nconsole.log(dog.speak())')}
<h2>Как читать этот урок</h2><p>Представляйте объект как карточку: ключ — подпись поля, значение — содержимое. Точка используется для известного имени, скобки — для имени из переменной.</p><div class="note"><b>Что должно остаться в голове:</b> Вы должны понимать свойства, методы, <code>this</code>, ссылки и поверхностное копирование через spread.</div>
`,
      task: {
        text: 'Напишите функцию countWords(text): она возвращает объект, где ключ — слово (в нижнем регистре), а значение — сколько раз оно встретилось в тексте. Слова разделены пробелами; пустой текст даёт {}.',
        starter: 'function countWords(text) {\n  const counts = {};\n  // ваш код\n  return counts;\n}\n',
        tests: `
test('простой случай', () => eq(countWords('a b a'), { a: 2, b: 1 }));
test('регистр не важен', () => eq(countWords('Да нет да ДА'), { 'да': 3, 'нет': 1 }));
test('лишние пробелы', () => eq(countWords('  x   y  x '), { x: 2, y: 1 }));
test('пустой текст', () => eq(countWords(''), {}));`,
        hints: ['Приведите текст к нижнему регистру и разбейте на слова: text.toLowerCase().split(" ").', 'Пропускайте пустые слова (они возникают от лишних пробелов). Счётчик: counts[word] = (counts[word] ?? 0) + 1.'],
        solution: 'function countWords(text) {\n  const counts = {};\n  for (const word of text.toLowerCase().split(" ")) {\n    if (word === "") continue;\n    counts[word] = (counts[word] ?? 0) + 1;\n  }\n  return counts;\n}'
      }
    },
    {
      id: 'immutability', t: 'JSON и неизменяемые данные',
      th: `
<p><b>JSON</b> — текстовый формат записи данных, очень похожий на объекты JavaScript. Именно в нём данные ходят по сети и хранятся в файлах. Два действия:</p>
${run('const text = JSON.stringify({ name: "Ада", langs: ["JS", "Py"] });\nconsole.log(text);\nconst obj = JSON.parse(text);\nconsole.log(obj.langs[0])')}
<p>${c('JSON.stringify')} превращает значение в строку, ${c('JSON.parse')} — обратно. Функции и ${c('undefined')} в JSON не попадают.</p>
<p><b>Неизменяемый подход.</b> Вместо того чтобы менять объект «на месте», создают <b>новый</b> с нужными отличиями. Это защищает от неожиданных побочных эффектов: другие части программы, державшие старый объект, остаются в порядке.</p>
${run('const user = { name: "Ада", age: 36 };\nconst older = { ...user, age: 37 };\nconsole.log(user.age, older.age)')}
<p>Spread ${c('{ ...user, age: 37 }')} копирует все свойства и затем перезаписывает ${c('age')}. Для массивов то же: ${c('[...list, newItem]')}.</p>
<aside class="note"><b>Копия бывает неглубокой.</b> Spread копирует только верхний уровень: вложенные объекты остаются общими. Полную копию делает ${c('structuredClone(obj)')}.</aside>
${run('const a = { inner: { x: 1 } };\nconst shallow = { ...a };\nshallow.inner.x = 2;\nconsole.log(a.inner.x);\nconst deep = structuredClone(a);\ndeep.inner.x = 3;\nconsole.log(a.inner.x)')}
<p>Чтобы запретить изменения совсем, применяют ${c('Object.freeze(obj)')}.</p>
<h2>Как читать этот урок</h2><p>Сначала определите, меняете ли вы исходный объект/массив или создаёте новый. Это принципиально для предсказуемого кода.</p><div class="note"><b>Что должно остаться в голове:</b> Вы должны понимать сериализацию JSON и разницу между копированием данных и сохранением той же ссылки.</div>
`,
      task: {
        text: 'Напишите функцию updateUser(user, changes): она возвращает НОВЫЙ объект со всеми свойствами user, в котором значения из changes заменили или дополнили старые. Исходный user менять нельзя.',
        starter: 'function updateUser(user, changes) {\n  // ваш код\n}\n',
        tests: `
test('меняет и добавляет свойства', () => eq(updateUser({ name: 'А', age: 1 }, { age: 2, city: 'М' }), { name: 'А', age: 2, city: 'М' }));
test('исходный объект не изменён', () => { const u = { name: 'А', age: 1 }; updateUser(u, { age: 2 }); eq(u, { name: 'А', age: 1 }); });
test('возвращается новый объект', () => { const u = { a: 1 }; assert(updateUser(u, {}) !== u, 'Нужно вернуть новый объект, а не тот же'); });`,
        hints: ['Не присваивайте свойства в user: это изменит оригинал.', 'return { ...user, ...changes };'],
        solution: 'function updateUser(user, changes) {\n  return { ...user, ...changes };\n}'
      }
    }
  ]
};
