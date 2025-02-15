/**
 * @typedef {Object} Todo
 * @property {string} text
 * @property {boolean} completed
 */

/**
 * @typedef {'All' | 'Active' | 'Completed'} Filter
 */

/**
 * @typedef {Object} State
 * @property {Todo[]} todos
 * @property {Filter} currentFilter
 */

/**
 * @typedef {Object} Events
 * @property {(index: number) => void} deleteItem
 * @property {(text: string) => void} addItem
 */

/**
 * @callback Component
 * @param {HTMLElement} element
 * @return {Node}
 */

/**
 * @callback Render
 * @param {HTMLElement} targetElement
 * @param {State} state
 * @param {Events} events
 * @return {HTMLElement}
 * */

/**
 * @callback RenderWrapper
 * @param {Component} component
 * @return {Render}
 */

/** @typedef {HTMLElement} CustomNode  */

/**
 * @typedef {Object} ApplyDiffParams
 * @property {CustomNode} parentNode
 * @property {CustomNode} realNode
 * @property {CustomNode} virtualNode
 */

/**
 * @callback ApplyDiff
 * @param {ApplyDiffParams}
 */

/**
 * @callback IsNodeChanged
 * @param {CustomNode} node1
 * @param {CustomNode} node2
 * @return {boolean}
 */

/** @typedef {HTMLTemplateElement | null | undefined} Template */

/** @typedef {{ fragment: string, component: () => Node }} Route */
/** @typedef {{ fragment: string, component: (params: object) => Node, regex: RegExp }} ProgrammingRoute */
/** @typedef {{ id: string }} DetailParams */
/** @typedef {{ id: string, anotherId: string }} AnotherDetailParams */

/**
 * @typedef {object} Router
 * @property {(param: Route) => Router} addRoute
 * @property {(cb: Function) => Router} setNotFound
 * @property {() => Router} start
 * */

/**
 * @typedef {object} ProgrammingRouter
 * @property {(param: ProgrammingRoute) => ProgrammingRouter} addRoute
 * @property {(cb: Function) => ProgrammingRouter} setNotFound
 * @property {() => ProgrammingRouter} start
 * @property {(fragment: string) => void} navigate
 * */
