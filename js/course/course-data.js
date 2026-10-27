/**
 * Данные курса JS 4All. Порядок глав следует книге «Выразительный JavaScript»
 * (М. Хавербеке, CC BY-NC 3.0), но тексты и задания написаны заново, а язык современный.
 */
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import ch3 from './ch3.js';
import ch4 from './ch4.js';
import ch5 from './ch5.js';
import ch6 from './ch6.js';
import ch7 from './ch7.js';
import ch8 from './ch8.js';
import ch9 from './ch9.js';
import ch10 from './ch10.js';

export const modules = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10];

/** Все основные темы текущей версии курса реализованы в главах выше. */
export const planned = [];

export const flat = () => modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ ...l, mod: m, modIndex: mi, index: li })));
