/** @type {IsNodeChanged} */
const isNodeChanged = (node1, node2) => {
  const n1Attributes = node1.attributes;
  const n2Attributes = node2.attributes;

  /** 어떤 속성이 추가 혹은 제거되었음. */
  const attributeLengthChanged = n1Attributes.length !== n2Attributes.length;

  if (attributeLengthChanged) {
    return true;
  }

  /** 어떤 속성의 값에 변경되었음 */
  const differentAttribute = Array.from(n1Attributes).find((attribute) => {
    const { name } = attribute;

    const attribute1 = node1.getAttribute(name);
    const attribute2 = node2.getAttribute(name);

    return attribute1 !== attribute2;
  });

  if (differentAttribute) {
    return true;
  }

  /** 자식 노드가 없고 텍스트만 있는 노드인데 텍스트가 변경되었음. */
  const textContentChanged =
    node1.children.length === 0 &&
    node2.children.length === 0 &&
    node1.textContent !== node2.textContent;

  if (textContentChanged) {
    return true;
  }

  return false;
};

/** @type {ApplyDiff} */
const applyDiff = ({ parentNode, realNode, virtualNode }) => {
  if (realNode && !virtualNode) {
    realNode.remove();
    return;
  }

  if (!realNode && virtualNode) {
    parentNode.appendChild(virtualNode);
    return;
  }

  if (isNodeChanged(virtualNode, realNode)) {
    realNode.replaceWith(virtualNode);
    return;
  }

  const realChildren = Array.from(realNode.children);
  const virtualChildren = Array.from(virtualNode.children);
  const max = Math.max(realChildren.length, virtualChildren.length);

  for (let i = 0; i < max; i++) {
    applyDiff({
      parentNode: realNode,
      realNode: realChildren[i],
      virtualNode: virtualChildren[i],
    });
  }
};

export default applyDiff;
