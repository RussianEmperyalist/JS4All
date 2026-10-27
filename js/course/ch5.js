import { run, c } from './h.js';

export default {
  id: 'hof', title: 'Функции высшего порядка',
  lessons: [
    {
      id: 'map-filter-reduce', t: 'map, filter, reduce',
      th: `
<p>Функции высшего порядка — это функции, которые <b>принимают другие функции</b> или возвращают их. В массивах они заменяют большинство ручных циклов и делают код короче и понятнее.</p>
<p>${c('forEach(fn)')} вызывает функцию для каждого элемента:</p>
${run('[10, 20, 30].forEach((x, i) => console.log(i, x))')}
<p>${c('map(fn)')} <b>преобразует</b> каждый элемент и возвращает новый массив той же длины:</p>
${run('const prices = [100, 250, 40];\nconsole.log(prices.map(p => p * 1.2))')}
<p>${c('filter(fn)')} <b>отбирает</b> элементы, для которых функция вернула истину:</p>
${run('const nums = [1, 2, 3, 4, 5, 6];\nconsole.log(nums.filter(n => n % 2 === 0))')}
<p>${c('reduce(fn, старт)')} <b>сворачивает</b> массив в одно значение. Функция получает накопленный результат и очередной элемент:</p>
${run('const nums = [1, 2, 3, 4];\nconsole.log(nums.reduce((total, n) => total + n, 0))')}
<p>Ещё полезные: ${c('find(fn)')} — первый подходящий элемент, ${c('some(fn)')} — есть ли хоть один подходящий, ${c('every(fn)')} — подходят ли все.</p>
<p>Главная сила — <b>цепочки</b>: результат одного метода сразу попадает в следующий.</p>
${run('const orders = [\n  { item: "книга", price: 500 },\n  { item: "ручка", price: 30 },\n  { item: "лампа", price: 900 }\n];\nconst expensive = orders.filter(o => o.price > 100).map(o => o.item);\nconsole.log(expensive)')}
<h2>Как читать этот урок</h2><p>Для каждого метода задайте один вопрос: <code>map</code> — «во что превратить каждый элемент?», </code>filter</code> — «кого оставить?», </code>reduce</code> — «во что собрать всё?».</p><div class="note"><b>Что должно остаться в голове:</b> Вы должны уметь читать цепочку методов без превращения её в магию.</div>
`,
      task: {
        text: 'Напишите функцию goodStudents(students): students — массив объектов вида { name, grades: [числа] }. Верните массив имён тех, чья средняя оценка не ниже 4, в исходном порядке. Используйте filter и map.',
        starter: 'function goodStudents(students) {\n  // ваш код\n}\n',
        tests: `
const data = [
  { name: 'Аня', grades: [5, 4, 5] },
  { name: 'Боря', grades: [3, 3, 4] },
  { name: 'Вера', grades: [4, 4] },
  { name: 'Глеб', grades: [2, 5] }
];
test('отбирает отличников и хорошистов', () => eq(goodStudents(data), ['Аня', 'Вера']));
test('пустой список', () => eq(goodStudents([]), []));
test('никто не подошёл', () => eq(goodStudents([{ name: 'Х', grades: [2, 3] }]), []));
test('использованы filter и map', () => assert(/\\.filter\\(/.test(source) && /\\.map\\(/.test(source), 'Используйте методы filter и map'));`,
        hints: ['Среднее = сумма оценок / их количество. Сумму даёт reduce((a, b) => a + b, 0).', 'students.filter(s => среднее(s.grades) >= 4).map(s => s.name)'],
        solution: 'function goodStudents(students) {\n  return students\n    .filter(s => s.grades.reduce((a, b) => a + b, 0) / s.grades.length >= 4)\n    .map(s => s.name);\n}'
      }
    },
    {
      id: 'sort-compose', t: 'Сортировка и композиция',
      th: `
<p>Метод ${c('sort')} упорядочивает массив, но у него есть подвох: без аргументов он сортирует <b>как строки</b>.</p>
${run('console.log([10, 9, 1, 100].sort())')}
<p>Чтобы сортировать числа, передают <b>функцию сравнения</b> ${c('(a, b) => ...')}. Она должна вернуть отрицательное число, если ${c('a')} идёт раньше ${c('b')}, положительное — если позже, и 0 при равенстве.</p>
${run('console.log([10, 9, 1, 100].sort((a, b) => a - b));\nconsole.log([10, 9, 1, 100].sort((a, b) => b - a))')}
<p>Для строк используют ${c('a.localeCompare(b)')}: он учитывает алфавит языка. Важно: ${c('sort')} <b>меняет исходный массив</b>. Чтобы этого избежать, сначала делают копию: ${c('[...arr].sort(...)')}.</p>
<p><b>Композиция</b> — собираем сложную функцию из простых. Функция ${c('pipe')} принимает несколько функций и возвращает новую, которая пропускает значение через все по очереди:</p>
${run('const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);\nconst process = pipe(x => x + 1, x => x * 2, x => "результат: " + x);\nconsole.log(process(3))')}
<p>Разберите ${c('reduce')} здесь: стартовое значение ${c('x')}, на каждом шаге очередная функция ${c('f')} применяется к накопленному ${c('v')}. Этот приём называют конвейером данных.</p>
<h2>Как читать этот урок</h2><p>У <code>sort</code> отдельно проверьте, что сравнивается, и помните: сортировка меняет массив. При композиции читайте цепочку слева направо.</p><div class="note"><b>Что должно остаться в голове:</b> Вы должны понимать функцию сравнения, неизменяющую копию через spread и идею конвейера функций.</div>
`,
      task: {
        text: 'Напишите две функции. sortBy(arr, key): возвращает НОВЫЙ массив объектов, отсортированный по возрастанию значения свойства key (числа или строки), исходный массив не менять. pipe(...fns): возвращает функцию, пропускающую значение через fns по очереди; без функций вернёт значение как есть.',
        starter: 'function sortBy(arr, key) {\n  // ваш код\n}\n\nfunction pipe(...fns) {\n  // ваш код\n}\n',
        tests: `
test('sortBy по числам', () => eq(sortBy([{ n: 3 }, { n: 1 }, { n: 2 }], 'n'), [{ n: 1 }, { n: 2 }, { n: 3 }]));
test('sortBy по строкам', () => eq(sortBy([{ t: 'яблоко' }, { t: 'арбуз' }], 't'), [{ t: 'арбуз' }, { t: 'яблоко' }]));
test('sortBy не меняет исходный массив', () => { const a = [{ n: 2 }, { n: 1 }]; sortBy(a, 'n'); eq(a, [{ n: 2 }, { n: 1 }]); });
test('pipe(f, g)(x) = g(f(x))', () => eq(pipe(x => x + 1, x => x * 2)(3), 8));
test('pipe без функций', () => eq(pipe()(5), 5));
test('pipe с тремя функциями', () => eq(pipe(x => x * 2, x => x - 1, String)(4), '7'));`,
        hints: ['Сначала скопируйте массив: [...arr], затем вызовите sort с функцией сравнения (a, b).', 'Сравнение подойдёт универсальное: a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0. Для pipe используйте reduce: fns.reduce((v, f) => f(v), x).'],
        solution: 'function sortBy(arr, key) {\n  return [...arr].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));\n}\n\nfunction pipe(...fns) {\n  return x => fns.reduce((v, f) => f(v), x);\n}'
       }
     },
     {
       id: 'hof-search', t: 'Поиск: find, some, every',
       th: `
<h2>1. find — найти первый подходящий</h2>
<p>Метод ${c('find(fn)')} возвращает первый элемент, для которого функция-предикат вернула истину. Если ничего не найдено — ${c('undefined')}:</p>
${run('const users = [\n  { id: 1, name: "Ада" },\n  { id: 2, name: "Боб" },\n  { id: 3, name: "Чарли" }\n];\nconsole.log(users.find(u => u.id === 2));\nconsole.log(users.find(u => u.id === 99))')}

<h2>2. findIndex — найти номер</h2>
<p>${c('findIndex(fn)')} возвращает индекс первого подходящего элемента, или -1, если нет:</p>
${run('console.log(["a", "b", "c"].findIndex(x => x === "b"));\nconsole.log(["a", "b", "c"].findIndex(x => x === "z"))')}

<h2>3. some и every — проверка условий</h2>
<p>${c('some(fn)')} возвращает ${c('true')}, если хотя бы один элемент подходит. ${c('every(fn)')} — если все подходят:</p>
${run('const nums = [2, 4, 6, 8];\nconsole.log(nums.some(n => n % 2 === 0));\nconsole.log(nums.some(n => n % 3 === 0));\nconsole.log(nums.every(n => n % 2 === 0));\nconsole.log(nums.every(n => n > 0))')}

<h2>4. some и every на пустом массиве</h2>
<p>Важная деталь: ${c('some')} на пустом массиве всегда ${c('false')} (никто не подошёл), а ${c('every')} — всегда ${c('true')} (формально все подходят, ведь нет контрпримера):</p>
${run('console.log([].some(x => x > 0));\nconsole.log([].every(x => x > 0))')}

<h2>5. Фильтрация vs поиск</h2>
<p>Выбирайте метод по задаче: ${c('filter')} возвращает ВСЕ подходящие в новом массиве, ${c('find')} — только первый, ${c('some')}/${c('every')} — только ${c('true')}/${c('false')}. Если нужно проверить, есть ли хоть один элемент с условием — используйте ${c('some')}, а не ${c('filter().length > 0')}:</p>
${run('const items = [{ price: 10 }, { price: 5 }, { price: 0 }];\nconst hasFree = items.some(i => i.price === 0);\nconsole.log(hasFree);\nconst freeItem = items.find(i => i.price === 0);\nconsole.log(freeItem)')}

<div class="note"><b>Подсказка:</b> если вам нужно не одно значение, а ответ «есть ли такой?» — используйте some или every. Если нужен конкретный элемент — find.</div>
<h2>Как читать этот урок</h2><p>Для каждого метода спросите: «найти первый?» (find), «есть ли такой?» (some), «все ли такие?» (every), «все подходящие?» (filter).</p><div class="note"><b>Что должно остаться в голове:</b> find возвращает первый подходящий или undefined; some — true, если кто-то подошёл; every — true, если все подошли; every на пустом массиве даёт true.</div>
`,
       task: {
         text: 'Напишите функцию hasAdults(people, minAge): она возвращает true, если в массиве people есть хотя бы один человек старше или равного minAge. Используйте some. people — массив объектов { name, age }.',
         starter: 'function hasAdults(people, minAge) {\n  // ваш код\n}\n',
         tests: `
test('есть взрослый', () => eq(hasAdults([{ name: 'А', age: 20 }, { name: 'Б', age: 17 }], 18), true));
test('нет взрослых', () => eq(hasAdults([{ name: 'А', age: 15 }, { name: 'Б', age: 17 }], 18), false));
test('пустой массив', () => eq(hasAdults([], 18), false));
test('граница: ровно minAge', () => eq(hasAdults([{ name: 'А', age: 18 }], 18), true));
test('не мутирует исходный массив', () => { const p = [{ name: 'А', age: 20 }]; hasAdults(p, 18); eq(p, [{ name: 'А', age: 20 }]); });`,
         hints: [
           'Используйте people.some(person => person.age >= minAge);',
           'some возвращает true, если callback вернул true для любого элемента.'
         ],
         solution: 'function hasAdults(people, minAge) {\n  return people.some(person => person.age >= minAge);\n}'
       }
     }
   ]
};
