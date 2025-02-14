export default class Footer extends HTMLElement {
  static observedAttributes() {
    return ['todos', 'filter'];
  }

  /** @return {Todo[]} */
  get todos() {
    if (!this.getAttribute('todos')) {
      return [];
    }

    return JSON.parse(this.getAttribute('todos'));
  }

  get filter() {
    return this.getAttribute('filter');
  }

  /** @param {boolean} value */
  set filter(value) {
    this.setAttribute('filter', value);
  }

  /** @param {Todo[]} todos */
  set todos(todos) {
    this.setAttribute('todos', JSON.stringify(todos));
  }

  getTodoCount() {
    const notCompleted = this.todos.filter((todo) => !todo.completed);

    const { length } = notCompleted;

    if (length === 1) {
      return '1 Item left';
    }

    return `${length} Items left`;
  }

  connectedCallback() {
    const template = document.getElementById('footer');
    const content = template.content.firstElementChild.cloneNode(true);

    this.appendChild(content);

    const { filter } = this;

    this.querySelectorAll('li a').forEach((a) => {
      if (a.textContent === filter) {
        a.classList.add('selected');
      } else {
        a.classList.remove('selected');
      }
    });

    const label = this.getTodoCount();

    this.querySelector('span.todo-count').textContent = label;
  }
}
