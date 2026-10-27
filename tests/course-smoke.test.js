import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { modules, flat, planned } from '../js/course/course-data.js';
import { runInSandbox } from '../js/engine/sandbox.js';
import { loadState, markDone, doneCount, isDone, setCode, getCode, exportData, importData, resetAll } from '../js/core/state.js';

const lessons = flat();
const jsFiles = [];
function collectJs(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') collectJs(path);
    else if (entry.isFile() && entry.name.endsWith('.js')) jsFiles.push(path);
  }
}
collectJs('js');
for (const file of jsFiles) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(check.status, 0, `Синтаксическая ошибка в ${file}: ${check.stderr}`);
}
assert.equal(modules.length, 10, 'Ожидается 10 глав курса');
assert.equal(lessons.length, 35, 'Ожидается 35 законченных урока');
assert.deepEqual(planned, [], 'В релизе не должно быть незаполненных тем «Скоро»');
assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length, 'ID уроков должны быть уникальны');

for (const chapter of modules) {
  assert.ok(chapter.title && chapter.id, `У главы ${chapter.id} должны быть заголовок и ID`);
  assert.ok(chapter.lessons.length, `Глава ${chapter.title} не должна быть пустой`);
}

const decodeHtml = (value) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const intentionalSnippetErrors = new Set(['variables', 'recursion']);
const observedSnippetErrors = new Set();
let snippetCount = 0;
for (const lesson of lessons) {
  for (const match of lesson.th.matchAll(/<pre class="run">([\s\S]*?)<\/pre>/g)) {
    snippetCount++;
    const result = await runInSandbox({ code: decodeHtml(match[1]), mode: 'snippet' });
    if (result.error) {
      assert.ok(intentionalSnippetErrors.has(lesson.id), `${lesson.id}: пример неожиданно падает: ${result.error}`);
      observedSnippetErrors.add(lesson.id);
    }
  }
}
assert.ok(snippetCount >= 50, `Ожидалось не менее 50 запускаемых примеров, получено ${snippetCount}`);
assert.deepEqual([...observedSnippetErrors].sort(), [...intentionalSnippetErrors].sort(), 'Набор намеренно ошибочных примеров должен быть известен и ограничен');

let totalTests = 0;
for (const lesson of lessons) {
  assert.ok(lesson.t && lesson.th, `${lesson.id}: отсутствует теория или заголовок`);
  assert.ok(lesson.task?.text && lesson.task.starter !== undefined, `${lesson.id}: отсутствует задание или стартовый код`);
  assert.ok(lesson.task.tests && lesson.task.solution && lesson.task.hints?.length, `${lesson.id}: отсутствуют тесты, решение или подсказки`);
  assert.match(lesson.th, /<h2>|<p>|<ul>/, `${lesson.id}: теория должна содержать структурированный HTML`);
  // Для DOM-уроков (с domHtml) пропускаем выполнение решения в Worker —
  // они требуют браузерного окружения и проверяются вручную через интерфейс.
  if (lesson.task.domHtml) continue;
  const result = await runInSandbox({ code: lesson.task.solution, tests: lesson.task.tests, mode: 'task' });
  assert.equal(result.error, null, `${lesson.id}: решение падает: ${result.error}`);
  assert.ok(result.results.length > 0, `${lesson.id}: нет проверочных тестов`);
  const failures = result.results.filter((r) => !r.ok);
  assert.deepEqual(failures, [], `${lesson.id}: решение не проходит тесты: ${failures.map((f) => `${f.name}: ${f.message}`).join('; ')}`);
  totalTests += result.results.length;
}

// Проверка прогресса, импорта/экспорта и фильтрации неизвестных ID.
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value)
};
loadState(lessons.map((l) => l.id));
resetAll();
markDone(lessons[0].id);
setCode(lessons[1].id, 'const answer = 42;');
assert.equal(doneCount(), 1);
assert.equal(isDone(lessons[0].id), true);
assert.equal(getCode(lessons[1].id), 'const answer = 42;');
const backup = JSON.parse(exportData());
backup.done.unknownLesson = 1;
backup.code.unknownLesson = 'ignored';
backup.code[lessons[1].id] = 'const answer = 99;';
importData(JSON.stringify(backup), lessons.map((l) => l.id));
assert.equal(doneCount(), 1, 'Импорт не должен накручивать прогресс неизвестными уроками');
assert.equal(getCode(lessons[1].id), 'const answer = 99;', 'Импортированный черновик должен заменять локальный');
assert.throws(() => importData('{bad json', lessons.map((l) => l.id)), /повреждён/);
resetAll();

console.log(`OK: ${modules.length} глав, ${lessons.length} уроков, ${totalTests} тестов заданий, ${snippetCount} примеров; прогресс и импорт/экспорт проверены.`);
