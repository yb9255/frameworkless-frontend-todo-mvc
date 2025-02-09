const registry = {};

/** @type {RenderWrapper} */
const renderWrapper = (component) => (targetElement, state, events) => {
  /**  @type {HTMLElement} */
  const element = component(targetElement, state, events);

  const childComponents = element.querySelectorAll('[data-component]');

  Array.from(childComponents).forEach((target) => {
    const name = target.dataset.component;

    const child = registry[name];

    if (!child) return;

    target.replaceWith(child(target, state, events));
  });

  return element;
};

/**
 * @param {HTMLElement} root
 * @param {State} state
 * @param {Events} events
 */
const renderRoot = (root, state, events) => {
  /** @type {Component} */
  const cloneComponent = (root) => {
    return root.cloneNode(true);
  };

  return renderWrapper(cloneComponent)(root, state, events);
};

/**
  @param {string} name
  @param {Node} component
*/
const add = (name, component) => {
  registry[name] = renderWrapper(component);
};

export default {
  add,
  renderRoot,
};
