/** @type {Template}  */
let template;

/** @return {Node} */
const createNewTodoNode = () => {
  if (!template) {
    const todoTemplate = document.getElementById('todo-item');

    if (!todoTemplate) return;

    template = todoTemplate;
  }

  return template.content.firstElementChild.cloneNode(true);
};

/**
 * @param {Todo} todo
 * @param {number} index
 * @return {Node}
 */
const getTodoElement = (todo, index) => {
  const { text, completed } = todo;

  const element = createNewTodoNode();

  element.querySelector('input.edit').value = text;
  element.querySelector('label').textContent = text;

  if (completed) {
    element.classList.add('completed');
    element.querySelector('input.toggle').checked = true;
  }

  element.querySelector('button.destroy').dataset.index = index;

  return element;
};

/**
 * @param {HTMLElement} targetElement
 * @param {State} state
 * @param {Events} events
 */
export default (targetElement, state, events) => {
  const { todos } = state;
  const { deleteItem } = events;
  const newTodoList = targetElement.cloneNode(true);

  newTodoList.innerHTML = '';

  todos
    .map((todo, index) => getTodoElement(todo, index))
    .forEach((element) => {
      newTodoList.appendChild(element);
    });

  newTodoList.addEventListener('click', (e) => {
    if (e.target.matches('button.destroy')) {
      deleteItem(e.target.dataset.index);
    }

    if (e.target.matches('input.toggle')) {
      if (e.target.checked) {
        e.target.closest('li').classList.add('completed');
      } else {
        e.target.closest('li').classList.remove('completed');
      }
    }
  });

  return newTodoList;
};
