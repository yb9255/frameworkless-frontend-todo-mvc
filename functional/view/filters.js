/**
 * @param {HTMLElement} targetElement
 * @param {string} currentFilter
 * @return {Node}
 */
export default (targetElement, { currentFilter }) => {
  /** @type {HTMLElement} */
  const newCounter = targetElement.cloneNode(true);

  Array.from(newCounter.querySelectorAll('li a')).forEach((a) => {
    if (a.textContent === currentFilter) {
      a.classList.add('selected');
    } else {
      a.classList.remove('selected');
    }
  });

  return newCounter;
};
