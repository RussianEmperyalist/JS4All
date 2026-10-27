/** Редактор кода на CodeMirror 6; при любой проблеме — запасной textarea. */
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { syntaxHighlighting, HighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { tags as t } from '@lezer/highlight';

const hl = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--c-kw)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--c-str)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--c-num)' },
  { tag: t.comment, color: 'var(--c-com)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: 'var(--c-fn)' },
  { tag: t.operator, color: 'var(--c-op)' }
]);

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--code-bg)', color: 'var(--code-ink)', fontSize: '14.5px' },
  '.cm-content': { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', caretColor: 'var(--ink)', padding: '8px 0' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--mute)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgba(127,127,127,.08)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '-1px' },
  '.cm-scroller': { overflow: 'auto', maxHeight: '60vh', minHeight: '150px' }
});

export function createEditor(parent, doc, { onRun, onChange } = {}) {
  try {
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc,
        extensions: [
          lineNumbers(), history(), indentOnInput(), bracketMatching(), closeBrackets(), highlightActiveLine(),
          javascript(), syntaxHighlighting(hl), theme,
          keymap.of([{ key: 'Mod-Enter', run: () => { if (onRun) onRun(); return true; } },
            ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.updateListener.of((u) => { if (u.docChanged && onChange) onChange(u.state.doc.toString()); })
        ]
      })
    });
    return {
      get: () => view.state.doc.toString(),
      set: (v) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } }),
      focus: () => view.focus(),
      destroy: () => view.destroy()
    };
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.className = 'fallback-editor'; ta.value = doc; ta.spellcheck = false; ta.rows = 10;
    ta.addEventListener('input', () => onChange && onChange(ta.value));
    ta.addEventListener('keydown', (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); onRun && onRun(); }
      if (ev.key === 'Tab') { ev.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    });
    parent.append(ta);
    return { get: () => ta.value, set: (v) => { ta.value = v; }, focus: () => ta.focus(), destroy: () => ta.remove() };
  }
}
