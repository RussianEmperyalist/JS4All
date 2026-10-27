/** JS 4All: маршрутизация, оглавление, уроки, редактор, проверка заданий. */
import { modules, planned, flat } from './course/course-data.js';
import { runCode } from './engine/runner.js';
import { createEditor } from './ui/editor.js';
import { loadState, isDone, doneCount, markDone, getCode, setCode, resetAll, exportData, importData } from './core/state.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LESSONS = flat();
const TOTAL = LESSONS.length;
let editor = null;

loadState(LESSONS.map((l) => l.id));

function toast(text) {
  const t = $('#toast'); t.textContent = text; t.className = 'on';
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = ''; }, 2400);
}

function renderConsole(el, r) {
  el.innerHTML = '';
  const add = (cls, text) => { const d = document.createElement('div'); d.className = cls; d.textContent = text; el.append(d); };
  (r.logs || []).forEach((l) => add(l.type, l.text));
  if (r.error) add('err', r.error);
  if (!el.childElementCount) add('dim', '(нет вывода)');
  el.hidden = false;
}

/* ---------- Оглавление и прогресс ---------- */
function renderToc(currentId) {
  let n = 0;
  $('#toc').innerHTML = modules.map((m, mi) =>
    `<h4><b>Глава ${mi + 1}.</b> ${esc(m.title)}</h4>` +
    m.lessons.map((l) => {
      n++;
      const d = isDone(l.id);
      return `<button class="l${d ? ' d' : ''}${l.id === currentId ? ' on' : ''}" data-id="${l.id}"><i>${d ? '✓' : n}</i>${esc(l.t)}</button>`;
    }).join('')
  ).join('') +
    (planned.length ? '<h4>Дополнительные темы</h4>' + planned.map((p) => `<div class="soon">${esc(p)}</div>`).join('') : '') +
    '<div class="tools"><button class="ghost" id="exp">Скачать прогресс</button><button class="ghost" id="imp">Загрузить прогресс</button><input type="file" id="impf" accept="application/json,.json" hidden><button class="ghost" id="rst">Сбросить всё</button></div>';
  updateMeter();
}

function updateMeter() {
  $('#bar').style.width = (TOTAL ? doneCount() / TOTAL * 100 : 0) + '%';
  $('#pc').textContent = doneCount() + ' / ' + TOTAL;
  $('.meter').setAttribute('aria-valuenow', String(Math.round(doneCount() / TOTAL * 100)));
}

function closeMenu() { $('#toc').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false'); }

/* ---------- Главная ---------- */
function showHome() {
  if (editor) { editor.destroy(); editor = null; }
  const next = LESSONS.find((l) => !isDone(l.id));
  $('#view').innerHTML = `
<div class="home">
  <section class="hero">
    <p class="kicker">Интерактивный курс по мотивам «Выразительного JavaScript»</p>
    <h1>JS 4All</h1>
    <p class="lead">Учите JavaScript, запуская настоящий код прямо в браузере: короткие объяснения, примеры, которые можно выполнить, и задания с автоматической проверкой.</p>
    <div class="acts">
      <a class="btn primary" href="#/l/${(next || LESSONS[0]).id}">${doneCount() ? 'Продолжить' : 'Начать читать'}</a>
      <span class="btn" style="cursor:default">${doneCount()} из ${TOTAL} уроков пройдено</span>
    </div>
  </section>
  ${modules.map((m, mi) => `<section class="chap"><h3>Глава ${mi + 1}. ${esc(m.title)}</h3><ol>${m.lessons.map((l) => `<li class="${isDone(l.id) ? 'd' : ''}"><a href="#/l/${l.id}">${esc(l.t)}</a></li>`).join('')}</ol></section>`).join('')}
  ${planned.length ? `<section class="chap soon"><h3>Дополнительные темы</h3><ul>${planned.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>` : ''}
  <p class="foot">Порядок глав следует книге Марейна Хавербеке «Выразительный JavaScript» (лицензия CC BY-NC 3.0, только некоммерческое использование). Тексты и задания написаны заново, язык — современный (ES2015+). Код запускается в отдельном Worker (или изолированном iframe для DOM-уроков) с ограничением времени; это не полноценная защита от вредоносного кода. Прогресс хранится только в вашем браузере.</p>
</div>`;
  renderToc(null); closeMenu(); window.scrollTo(0, 0);
}

/* ---------- Урок ---------- */
function showLesson(i) {
  if (editor) { editor.destroy(); editor = null; }
  const l = LESSONS[i];
  const done = isDone(l.id);
  $('#view').innerHTML = `
<article>
  <p class="kicker">Глава ${l.modIndex + 1} · ${esc(l.mod.title)}</p>
  <h1>${esc(l.t)}</h1>
  <div class="prose">${l.th}</div>
  <section class="task${done ? ' ok' : ''}" id="task">
    <h2>Упражнение</h2>
    <p>${esc(l.task.text)}</p>
    <div id="ed"></div>
    <div class="bar">
      <button class="btn primary" id="check">✓ Проверить</button>
      <button class="btn" id="exec">▶ Запустить</button>
      <button class="btn" id="reset">Сбросить код</button>
      <button class="btn" id="hint">Подсказка</button>
    </div>
    <div class="con" id="out" role="status" aria-live="polite" hidden></div>
    <div id="res" aria-live="polite" aria-atomic="true"></div>
    <div class="hints" id="hints"></div>
  </section>
  <nav class="pager"><button class="btn" id="prev"${i ? '' : ' disabled'}>← Назад</button><button class="btn primary" id="next"${i < TOTAL - 1 ? '' : ' disabled'}>Далее →</button></nav>
</article>`;

  // запускаемые примеры в теории
  document.querySelectorAll('#view pre.run').forEach((pre) => {
    const code = pre.textContent;
    const box = document.createElement('div'); box.className = 'runblock';
    pre.replaceWith(box); box.append(pre);
    const bar = document.createElement('div'); bar.className = 'rb';
    const b = document.createElement('button'); b.textContent = '▶ Выполнить';
    bar.append(b);
    const out = document.createElement('div'); out.className = 'con'; out.hidden = true;
    box.append(bar, out);
    b.onclick = async () => {
      b.disabled = true;
      renderConsole(out, await runCode(code, { mode: 'snippet' }));
      b.disabled = false;
    };
  });

  const start = getCode(l.id) ?? l.task.starter;
  let saveTimer = 0;
  editor = createEditor($('#ed'), start, {
    onRun: () => check(),
    onChange: (v) => { clearTimeout(saveTimer); saveTimer = setTimeout(() => setCode(l.id, v === l.task.starter ? undefined : v), 400); }
  });

  async function check() {
    $('#check').disabled = true; $('#res').innerHTML = '<p class="verdict">Проверяю…</p>';
    const opts = { tests: l.task.tests, mode: 'task' };
    if (l.task.domHtml) { opts.domHtml = l.task.domHtml; opts.timeout = 5000; }
    const r = await runCode(editor.get(), opts);
    $('#check').disabled = false;
    renderConsole($('#out'), r);
    if (!r.logs.length && !r.error) $('#out').hidden = true;
    const results = r.results || [];
    const allOk = !r.error && results.length > 0 && results.every((x) => x.ok);
    $('#res').innerHTML =
      (results.length ? `<ul class="res">${results.map((x) => `<li class="${x.ok ? 'pass' : 'fail'}">${esc(x.name)}${x.ok ? '' : `<small>${esc(x.message)}</small>`}</li>`).join('')}</ul>` : '') +
      (r.error ? '<p class="verdict bad">Код не выполнился — исправьте ошибку выше.</p>' : allOk ? '<p class="verdict ok">Все тесты пройдены. Отличная работа!</p>' : '<p class="verdict bad">Пока не все тесты проходят. Посмотрите, что ожидалось, и попробуйте ещё раз.</p>');
    if (allOk && !isDone(l.id)) {
      markDone(l.id); $('#task').classList.add('ok'); renderToc(l.id); toast(doneCount() === TOTAL ? 'Курс пройден! 🎉' : 'Урок пройден ✓');
    }
  }
  $('#check').onclick = check;
  $('#exec').onclick = async () => {
    $('#exec').disabled = true;
    const opts = { mode: 'task' };
    if (l.task.domHtml) { opts.domHtml = l.task.domHtml; opts.timeout = 5000; }
    renderConsole($('#out'), await runCode(editor.get(), opts));
    $('#exec').disabled = false;
  };
  $('#reset').onclick = () => { editor.set(l.task.starter); setCode(l.id, undefined); $('#res').innerHTML = ''; };

  let shown = 0;
  $('#hint').onclick = () => {
    const H = l.task.hints || [];
    const box = $('#hints');
    if (shown < H.length) {
      const p = document.createElement('p'); p.textContent = 'Подсказка ' + (shown + 1) + ': ' + H[shown]; box.append(p); shown++;
      if (shown === H.length) $('#hint').textContent = 'Показать решение';
    } else if (shown === H.length) {
      const pre = document.createElement('pre'); pre.textContent = l.task.solution; box.append(pre); shown++; $('#hint').disabled = true;
    }
  };
  $('#prev').onclick = () => { location.hash = '#/l/' + LESSONS[i - 1].id; };
  $('#next').onclick = () => { location.hash = '#/l/' + LESSONS[i + 1].id; };
  renderToc(l.id); closeMenu(); window.scrollTo(0, 0);
}

/* ---------- Маршрутизация и события ---------- */
function route() {
  const m = /^#\/l\/([\w-]+)$/.exec(location.hash);
  const i = m ? LESSONS.findIndex((l) => l.id === m[1]) : -1;
  if (i >= 0) showLesson(i); else showHome();
}
window.addEventListener('hashchange', route);

$('#menu').onclick = () => { const o = $('#toc').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', String(o)); };
$('#toc').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.id) { location.hash = '#/l/' + b.dataset.id; closeMenu(); return; }
  if (b.id === 'exp') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    a.download = 'jsforall-progress.json'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } else if (b.id === 'imp') { $('#impf').click(); }
  else if (b.id === 'rst') {
    if (b.dataset.sure) { resetAll(); delete b.dataset.sure; route(); toast('Прогресс сброшен'); }
    else { b.dataset.sure = '1'; b.textContent = 'Точно сбросить?'; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = 'Сбросить всё'; } }, 3000); }
  }
};
$('#toc').addEventListener('change', async (e) => {
  if (e.target.id !== 'impf' || !e.target.files[0]) return;
  try { importData(await e.target.files[0].text(), LESSONS.map((l) => l.id)); toast('Прогресс загружен'); route(); }
  catch (err) { toast(err.message || 'Не удалось прочитать файл'); }
  finally { e.target.value = ''; }
});

route();
