/**
 * @param {Todo[]} todos
 */
const getTodoCount = (todos) => {
  const notCompleted = todos.filter((todo) => !todo.completed);
  const { length } = notCompleted;

  if (length === 1) {
    return `1 Item left`;
  }

  return `${length} Items left`;
};

/**
 * @param {HTMLElement} targetElement
 * @param {Todo[]} todos
 * @return {Node}
 */
export default (targetElement, { todos }) => {
  const newCounter = targetElement.cloneNode(true);
  newCounter.textContent = getTodoCount(todos);

  return newCounter;
};
