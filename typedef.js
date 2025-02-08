/**
 * @typedef {Object} Todo
 * @property {string} text
 * @property {boolean} completed
 */

/**
 * @typedef {Object} State
 * @property {Todo[]} todos
 * @property {string} currentFilter
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
