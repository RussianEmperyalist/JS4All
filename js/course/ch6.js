import { run, c } from './h.js';

export default {
  id: 'advanced-objects', title: 'Продвинутые объекты',
  lessons: [
    {
      id: 'classes-prototypes', t: 'Классы, прототипы и наследование',
      th: `
<h2>1. Зачем нужны классы</h2>
<p>Когда в программе появляется много похожих объектов, удобно описать один общий «чертёж». В JavaScript для этого можно использовать <b>классы</b>.</p>
<pre><code>class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return "Привет, " + this.name;
  }
}

const user = new User("Ада");
console.log(user.greet());</code></pre>
<p><code>class User</code> создаёт описание класса. <code>constructor</code> выполняется при создании объекта через <code>new</code>. <code>this</code> — конкретный объект, с которым сейчас работает метод.</p>

<h2>2. Класс — не отдельный «тип объекта» в старом смысле</h2>
<p>Внутри JavaScript классы построены поверх <b>прототипов</b>. У объекта есть скрытая связь с другим объектом — его прототипом. Если свойство не найдено непосредственно в объекте, JavaScript ищет его выше по цепочке прототипов.</p>
${run('const animal = { speak() { return "звук"; } };\nconst dog = Object.create(animal);\nconsole.log(dog.speak());\nconsole.log(Object.getPrototypeOf(dog) === animal)')}

<h2>3. Наследование</h2>
<p><code>extends</code> позволяет сделать новый класс на основе существующего, а <code>super</code> обратиться к родительскому классу.</p>
<pre><code>class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return this.name + " издаёт звук";
  }
}

class Dog extends Animal {
  speak() {
    return this.name + " говорит гав";
  }
}

console.log(new Dog("Рекс").speak());</code></pre>

<h2>4. Что важно запомнить</h2>
<ul>
<li><code>new</code> создаёт экземпляр класса.</li>
<li><code>constructor</code> подготавливает новый объект.</li>
<li><code>this</code> обычно указывает на объект, у которого вызван метод.</li>
<li><code>extends</code> создаёт наследование.</li>
<li>классы в JavaScript используют прототипное наследование.</li>
</ul>

<div class="note"><b>Не нужно учить прототипы наизусть.</b> На этом этапе достаточно понимать главное: методы могут находиться не прямо в объекте, а в его цепочке прототипов.</div>
<h2>Как читать этот урок</h2><p>Читайте класс как шаблон объекта: конструктор задаёт начальные поля, а методы описывают действия. Наследование полезно, когда один тип действительно является разновидностью другого.</p><div class="note"><b>Что должно остаться в голове:</b> Уметь создать экземпляр класса, использовать this и объяснить, что классы JavaScript опираются на прототипы.</div>
`,
      task: {
        text: 'Создайте класс Rectangle с constructor(width, height) и методом area(), который возвращает площадь. Создайте прямоугольник 5×4 и убедитесь, что area() возвращает 20.',
        starter: 'class Rectangle {\n  // ваш код\n}\n',
        tests: `test('площадь', () => eq(new Rectangle(5, 4).area(), 20));
test('другой прямоугольник', () => eq(new Rectangle(10, 3).area(), 30));`,
        hints: ['Сохраните width и height в this.width и this.height.', 'Метод area() должен вернуть this.width * this.height.'],
        solution: 'class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  area() {\n    return this.width * this.height;\n  }\n}'
      }
    },
    {
      id: 'getters-setters', t: 'Геттеры, сеттеры и вычисляемые свойства',
      th: `
<h2>1. Геттер вместо метода-геттера</h2>
<p>Обычный метод требует скобок при вызове: ${c('obj.getName()')}. <b>Геттер</b> выглядит как обычное поле, но значение вычисляется каждый раз при обращении. Ключевое слово ${c('get')} перед именем метода превращает его в геттер:</p>
${run('class Person {\n  constructor(first, last) {\n    this.first = first;\n    this.last = last;\n  }\n  get fullName() {\n    return this.first + " " + this.last;\n  }\n}\nconst p = new Person("Мария", "Кюри");\nconsole.log(p.fullName);\nconsole.log(typeof p.fullName)')}
<p>Обратите внимание: мы пишем ${c('p.fullName')} без скобок, как будто это поле объекта. Но внутри каждый раз выполняется функция.</p>

<h2>2. Сеттер — проверка и преобразование при записи</h2>
<p><b>Сеттер</b> перехватывает присваивание значения. Ключевое слово ${c('set')} объявляет метод, который вызывается при ${c('obj.field = value')}. Это удобное место для проверки данных:</p>
${run('class Temperature {\n  constructor(celsius) {\n    this.celsius = celsius;\n  }\n  get fahrenheit() {\n    return this.celsius * 9 / 5 + 32;\n  }\n  set fahrenheit(v) {\n    this.celsius = (v - 32) * 5 / 9;\n  }\n}\nconst t = new Temperature(100);\nconsole.log(t.fahrenheit);\nt.fahrenheit = 212;\nconsole.log(t.celsius)')}
<p>Запись ${c('t.fahrenheit = 212')} не создаёт новое поле — она вызывает сеттер, который пересчитывает ${c('this.celsius')}.</p>

<h2>3. Приватные поля (#)</h2>
<p>Поле с символом ${c('#')} перед именем недоступно снаружи класса — это <b>приватное поле</b>. Оно есть только у экземпляра и не попадёт в ${c('Object.keys')}:</p>
${run('class BankAccount {\n  #balance = 0;\n  deposit(sum) {\n    if (sum <= 0) throw new Error("Сумма должна быть положительной");\n    this.#balance += sum;\n  }\n  get balance() {\n    return this.#balance;\n  }\n}\nconst acc = new BankAccount();\nacc.deposit(500);\nconsole.log(acc.balance);\ntry { acc.deposit(-1); } catch(e) { console.log(e.name); }')}

<h2>4. Статические методы</h2>
<p>Метод с ключевым словом ${c('static')} принадлежит самому классу, а не экземплярам. Его вызывают как ${c('ClassName.method()')}, а не ${c('instance.method()')}:</p>
${run('class MathUtils {\n  static gcd(a, b) {\n    while (b !== 0) { [a, b] = [b, a % b]; }\n    return a;\n  }\n  static lcm(a, b) {\n    return a * b / MathUtils.gcd(a, b);\n  }\n}\nconsole.log(MathUtils.gcd(12, 8));\nconsole.log(MathUtils.lcm(4, 6))')}

<h2>5. Когда что использовать</h2>
<ul>
<li><b>Геттер</b> — когда значение логически является свойством, но вычисляется из других полей.</li>
<li><b>Сеттер</b> — когда запись нужно проверить или преобразовать.</li>
<li><b>Приватное поле (#)</b> — когда внутреннее состояние не должно меняться извне.</li>
<li><b>Статический метод</b> — когда операция относится к классу в целом, а не к конкретному экземпляру.</li>
</ul>
<h2>Как читать этот урок</h2><p>Если видите ${c('get имя()')} или ${c('set имя(value)')} — это не обычные методы, а доступ к свойству. При чтении кода представляйте их как «поле, которое само считает или проверяет себя».</p><div class="note"><b>Что должно остаться в голове:</b> Геттер вызывается без скобок, сеттер перехватывает присваивание, приватное поле начинается с # и недоступно снаружи, статический метод вызывается от класса.</div>
`,
      task: {
        text: 'Создайте класс Score с приватным полем #value. Геттер value возвращает текущее число. Сеттер value принимает только числа от 0 до 100 включительно; при выходе за диапазон выбрасывает RangeError со строкой "out of range". Метод reset() устанавливает значение в 0. Статический метод Score.fromArray(arr) возвращает максимальный элемент массива чисел (или null, если массив пуст).',
        starter: 'class Score {\n  // ваш код\n}\n',
        tests: `
test('геттер возвращает начальное значение 0', () => eq(new Score().value, 0));
test('сеттер сохраняет допустимое значение', () => { const s = new Score(); s.value = 50; eq(s.value, 50); });
test('сеттер бросает RangeError при > 100', () => { const s = new Score(); let thrown = false; try { s.value = 101; } catch (e) { thrown = e instanceof RangeError; } assert(thrown, 'Ожидался RangeError'); });
test('сеттер бросает RangeError при < 0', () => { const s = new Score(); let thrown = false; try { s.value = -1; } catch (e) { thrown = e instanceof RangeError; } assert(thrown, 'Ожидался RangeError'); });
test('границы 0 и 100 допустимы', () => { const s = new Score(); s.value = 0; eq(s.value, 0); s.value = 100; eq(s.value, 100); });
test('reset обнуляет', () => { const s = new Score(); s.value = 88; s.reset(); eq(s.value, 0); });
test('Score.fromArray — максимум', () => eq(Score.fromArray([3, 7, 2]), 7));
test('Score.fromArray — пустой массив даёт null', () => eq(Score.fromArray([]), null));
test('приватное поле недоступно снаружи', () => { const s = new Score(); assert(!('#value' in s), '#value не должен быть доступен через in'); });`,
        hints: [
          'Для приватного поля напишите #value = 0; внутри объявления класса.',
          'Геттер: get value() { return this.#value; }. Сеттер: set value(n) { if (typeof n !== "number" || n < 0 || n > 100) throw new RangeError("out of range"); this.#value = n; }',
          'Статический метод: static fromArray(arr) { return arr.length ? Math.max(...arr) : null; }.'
        ],
        solution: 'class Score {\n  #value = 0;\n  get value() {\n    return this.#value;\n  }\n  set value(n) {\n    if (typeof n !== "number" || n < 0 || n > 100) {\n      throw new RangeError("out of range");\n    }\n    this.#value = n;\n  }\n  reset() {\n    this.#value = 0;\n  }\n  static fromArray(arr) {\n    return arr.length ? Math.max(...arr) : null;\n  }\n}'
      }
    },
    {
      id: 'prototype-chain', t: 'Цепочка прототипов и Object.create',
      th: `
<h2>1. Как на самом деле работает наследование</h2>
<p>Классы JavaScript — синтаксический сахар над <b>прототипным наследованием</b>. Каждый объект имеет скрытое поле [[Prototype]] — ссылку на другой объект. Когда JavaScript ищет свойство, он сначала смотрит в самом объекте, затем в его прототипе, потом в прототипе прототипа, и так до ${c('null')}.</p>
${run('const base = { kind: "животное", describe() { return "это " + this.kind; } };\nconst cat = Object.create(base);\ncat.kind = "кошка";\nconsole.log(cat.describe());\nconsole.log(Object.getPrototypeOf(cat) === base)')}
<p>${c('Object.create(obj)')} создаёт новый пустой объект, прототипом которого будет ${c('obj')}. Обратите внимание: ${c('cat')} сам не содержит метод ${c('describe')}, но находит его в ${c('base')} через цепочку.</p>

<h2>2. Собственные свойства против унаследованных</h2>
<p>${c('in')} находит свойство где угодно в цепочке. Для проверки только собственных свойств используйте ${c('hasOwnProperty')} или ${c('Object.hasOwn(obj, key)')} (новый способ):</p>
${run('const parent = { a: 1 };\nconst child = Object.create(parent);\nchild.b = 2;\nconsole.log("a" in child);\nconsole.log(child.hasOwnProperty("a"));\nconsole.log(Object.hasOwn(child, "b"));\nconsole.log(Object.keys(child))')}
<p>${c('Object.keys')} перечисляет только собственные перечислимые свойства — ${c('a')} туда не попал.</p>

<h2>3. Прототип функции-конструктора</h2>
<p>До появления ${c('class')} объекты создавали через функции-конструкторы, а общие методы клали в ${c('Fn.prototype')}. Экземпляр получает ${c('[Prototype] === Fn.prototype')} автоматически:</p>
${run('function Point(x, y) {\n  this.x = x;\n  this.y = y;\n}\nPoint.prototype.dist = function () {\n  return Math.sqrt(this.x ** 2 + this.y ** 2);\n};\nconst p = new Point(3, 4);\nconsole.log(p.dist());\nconsole.log(Object.getPrototypeOf(p) === Point.prototype)')}

<h2>4. getPrototypeOf и конец цепочки</h2>
<p>Любая цепочка прототипов заканчивается ${c('null')}. У большинства объектов предпоследнее звено — ${c('Object.prototype')}, откуда приходят ${c('toString')}, ${c('hasOwnProperty')} и другие базовые методы:</p>
${run('let obj = { x: 1 };\nlet chain = [];\nwhile (obj !== null) {\n  chain.push(Object.keys(obj).length);\n  obj = Object.getPrototypeOf(obj);\n}\nconsole.log(chain.join(" -> "))')}

<h2>5. class extends под капотом</h2>
<p>Когда вы пишете ${c('class B extends A')}, JavaScript делает ${c('B.prototype.__proto__ === A.prototype')}, то есть методы ${c('A')} становятся прототипом методов ${c('B')}. Понимание цепочки помогает отлаживать странные ошибки вроде ${c('this is undefined')} при потере контекста:</p>
${run('class Greeter {\n  constructor(name) { this.name = name; }\n  greet() { return "Привет, " + this.name; }\n}\nconst g = new Greeter("Ада");\nconst fn = g.greet;\ntry { console.log(fn()); } catch (e) { console.log(e.name); }\nconsole.log(fn.call(g))')}
<div class="note"><b>Зачем это знать:</b> когда метод передают как callback без ${c('.bind')} или стрелочной обёртки, ${c('this')} теряется. Знание прототипов объясняет почему.</div>
<h2>Как читать этот урок</h2><p>Если свойство «есть, но его нет», ищите его в ${c('Object.getPrototypeOf(obj)')}, затем выше. Для создания чистого объекта без прототипа используйте ${c('Object.create(null)')}.</p><div class="note"><b>Что должно остаться в голове:</b> Объекты связаны цепочкой прототипов; поиск идёт вверх; hasOwnProperty и Object.hasOwn проверяют только самого себя; Object.create задаёт прототип явно.</div>
`,
      task: {
        text: 'Реализуйте функцию deepMerge(target, source): сливает два объекта по прототипной цепочке. Правила: (1) если оба значения — простые (не объекты), результат из source перезаписывает target; (2) если оба — обычные объекты (не массивы), рекурсивно слейте их свойства; (3) если source содержит undefined в ключе, удалите этот ключ из результата. Возвращайте НОВЫЙ объект, исходные не мутируйте.',
        starter: 'function deepMerge(target, source) {\n  // ваш код\n}\n',
        tests: `
test('простое перезаписывание', () => eq(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 }), { a: 1, b: 3, c: 4 }));
test('вложенные объекты', () => eq(deepMerge({ x: { y: 1, z: 2 } }, { x: { z: 3, w: 4 } }), { x: { y: 1, z: 3, w: 4 } }));
test('undefined удаляет ключ', () => eq(deepMerge({ a: 1, b: 2 }, { a: undefined }), { b: 2 }));
test('три уровня вложенности', () => eq(deepMerge({ l1: { l2: { v: 1 } } }, { l1: { l2: { v: 2 } } }), { l1: { l2: { v: 2 } } }));
test('target не мутируется', () => { const t = { a: 1 }; deepMerge(t, { b: 2 }); eq(t, { a: 1 }); });
test('source не мутируется', () => { const s = { b: 2 }; deepMerge({ a: 1 }, s); eq(s, { b: 2 }); });
test('возвращается новый объект при пустом source', () => { const t = { a: 1 }; const r = deepMerge(t, {}); assert(r !== t, 'Должен быть новый объект'); });
test('пустой target', () => eq(deepMerge({}, { a: 1 }), { a: 1 }));`,
        hints: [
          'Проверка «обычный объект»: typeof v === "object" && v !== null && !Array.isArray(v).',
          'Сделайте поверхностную копию target через spread. Для каждого ключа source решите: если оба значения — обычные объекты, вызовите deepMerge рекурсивно; иначе запишите значение из source.',
          'После сборки результата пройдите по нему и удалите все ключи со значением undefined (delete result[key]).'
        ],
        solution: 'function deepMerge(target, source) {\n  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);\n  const result = { ...target };\n  for (const key of Object.keys(source)) {\n    const sv = source[key];\n    if (sv === undefined) {\n      delete result[key];\n    } else if (isObj(sv) && isObj(result[key])) {\n      result[key] = deepMerge(result[key], sv);\n    } else {\n      result[key] = sv;\n    }\n  }\n  return result;\n}'
      }
    }
  ]
};