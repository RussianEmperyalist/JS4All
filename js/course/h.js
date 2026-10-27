/** Хелперы для записи уроков: экранирование и запускаемые примеры. */
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const run = (code) => `<pre class="run">${esc(String(code).trim())}</pre>`;
export const c = (code) => `<code>${esc(code)}</code>`;
