/** @type {Template} */
let template;

const getTemplate = () => {
  if (!template) {
    const appTemplate = document.getElementById('todo-app');

    if (!appTemplate) return;

    template = appTemplate;
  }

  return template.content.firstElementChild.cloneNode(true);
};

/**
 * @param {HTMLElement} targetElement
 * @param {Events} events
 */
const addEvents = (targetElement, events) => {
  targetElement.querySelector('.new-todo').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      events.addItem(e.target.value);
      e.target.value = '';
    }
  });
};

/**
 * @param {HTMLElement} targetElement
 * @param {State} state
 * @param {Events} events
 */
export default (targetElement, state, events) => {
  const newApp = targetElement.cloneNode(true);

  newApp.innerHTML = '';
  newApp.appendChild(getTemplate());

  addEvents(newApp, events);

  return newApp;
};
