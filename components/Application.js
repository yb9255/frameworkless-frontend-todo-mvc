import { EVENTS } from './List.js';

export default class App extends HTMLElement {
  /** @type {State} */
  state;

  /** @type {Template} */
  template;

  /** @type {Node} */
  list;

  /** @type {Node} */
  footer;

  constructor() {
    super();

    this.state = {
      todos: [],
      currentFilter: 'All',
    };

    this.template = document.getElementById('todo-app');
  }

  /** @param {number} index */
  deleteItem(index) {
    this.state.todos.splice(index, 1);
    this.syncAttribute();
  }

  /**
   *
   * @param {string} text
   */
  addItem(text) {
    this.state.todos.push({
      text,
      completed: false,
    });
  }

  syncAttribute() {
    this.list.todos = this.state.todos;
    this.footer.todos = this.state.todos;
    this.footer.filter = this.state.currentFilter;
  }

  connectedCallback() {
    window.requestAnimationFrame(() => {
      const content = this.template.content.firstElementChild.cloneNode(true);

      this.appendChild(content);

      this.querySelector('.new-todo').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addItem(e.target.value);
          e.target.value = '';
        }
      });

      this.footer = this.querySelector('todomvc-footer');
      this.list = this.querySelector('todomvc-list');

      this.list.addEventListener(EVENTS.DELETE_ITEM, (e) => {
        this.deleteItem(e.detail.index);
      });

      this.syncAttribute();
    });
  }
}
