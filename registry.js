const registry = {};

/** @type {RenderWrapper} */
const renderWrapper = (component) => (targetElement, state) => {
  /**  @type {HTMLElement} */
  const element = component(targetElement, state);

  const childComponents = element.querySelectorAll('[data-component]');

  Array.from(childComponents).forEach((target) => {
    const name = target.dataset.component;

    const child = registry[name];

    if (!child) return;

    target.replaceWith(child(target, state));
  });

  return element;
};

/**
 * @param {HTMLElement} root
 * @param {State} state
 */
const renderRoot = (root, state) => {
  /** @type {Component} */
  const cloneComponent = (root) => {
    return root.cloneNode(true);
  };

  return renderWrapper(cloneComponent)(root, state);
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
