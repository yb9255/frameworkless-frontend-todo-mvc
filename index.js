import getTodos from './getTodos.js';
import { todosView, filtersView, counterView } from './view/index.js';
import registry from './registry.js';
import applyDiff from './applyDiff.js';

registry.add('todos', todosView);
registry.add('counter', counterView);
registry.add('filters', filtersView);

const state = {
  todos: getTodos(),
  currentFilter: 'All',
};

window.requestAnimationFrame(() => {
  const main = document.querySelector('.todoapp');

  if (!main || main instanceof HTMLElement === false) {
    return;
  }

  const newMain = registry.renderRoot(main, state);

  applyDiff({
    parentNode: document.body,
    realNode: main,
    virtualNode: newMain,
  });
});
