# applyDiff.js 명세서

가상 DOM 트리와 실제 DOM 트리를 비교해 **바뀐 부분만 실제 DOM에 반영**하는
간이 diff 알고리즘. 처음부터 다시 구현할 때 충족해야 할 요구사항을 정리한 문서다.

---

## 1. 목적 (왜 필요한가)

`registry.renderRoot()`는 매 렌더마다 **완전히 새로운 DOM 트리**를 만들어 반환한다.
이걸 그대로 `document.body.replaceChild()`로 통째로 갈아끼우면 동작은 하지만:

- 화면 전체가 다시 그려져 **깜빡임(flickering)** 이 생긴다
- 포커스, 스크롤 위치, `input`의 커서 위치 등 **DOM 상태가 날아간다**
- 브라우저의 리플로우/리페인트 비용이 크다

그래서 새 트리를 통째로 교체하는 대신, 실제 트리와 비교해서
**정말 달라진 노드만 최소한으로 손대는** 것이 이 모듈의 역할이다.

---

## 2. 공개 API

```js
applyDiff(parentNode, realNode, virtualNode) => void
```

- **`parentNode`**: `realNode`의 부모. 새 노드를 추가(append)해야 할 때 필요하다.
- **`realNode`**: 현재 화면에 실제로 붙어 있는 노드 (없을 수 있음)
- **`virtualNode`**: 새로 렌더링된, 아직 화면에 없는 노드 (없을 수 있음)
- **반환값 없음.** 실제 DOM을 제자리에서(in-place) 변경하는 부수효과 함수다.
- 모듈은 이 함수를 **default export** 한다.

---

## 3. 핵심 동작 (반드시 이 순서대로)

`applyDiff`는 아래 4가지 경우를 **위에서부터 순서대로** 판단하고, 처리되면 즉시 종료한다.

### (1) 노드 삭제 — real은 있고 virtual은 없음
새 트리에 해당 자리가 없다는 뜻이므로 실제 노드를 제거한다.
```js
if (realNode && !virtualNode) { realNode.remove(); return; }
```

### (2) 노드 추가 — real은 없고 virtual은 있음
새로 생긴 자리이므로 부모에 붙인다. **이때 `parentNode`가 필요하다.**
```js
if (!realNode && virtualNode) { parentNode.appendChild(virtualNode); return; }
```

### (3) 노드 교체 — 둘 다 있지만 "변경됨"으로 판정
`isNodeChanged`가 true면 하위를 더 볼 것 없이 통째로 갈아끼운다.
```js
if (isNodeChanged(virtualNode, realNode)) { realNode.replaceWith(virtualNode); return; }
```

### (4) 자식으로 재귀 — 둘 다 있고 자기 자신은 동일
노드 자체는 같으므로 **자식 목록을 인덱스로 짝지어** 재귀 호출한다.
```js
const realChildren = Array.from(realNode.children);
const virtualChildren = Array.from(virtualNode.children);
const max = Math.max(realChildren.length, virtualChildren.length);
for (let i = 0; i < max; i++) {
  applyDiff(realNode, realChildren[i], virtualChildren[i]);
}
```
- 길이가 다르면 짧은 쪽은 `undefined`가 되고, 그게 위의 (1)/(2)로 흡수된다.
  → 그래서 `Math.max`를 써야 하고, `for` 루프여야 한다. (`forEach`는 빈 칸을 건너뜀)
- 재귀 시 `parentNode` 자리에는 **`realNode`** 를 넘긴다. (가상 노드가 아니라 실제 노드)

---

## 4. 변경 판정 로직 (`isNodeChanged`)

`isNodeChanged(node1, node2) => boolean`. 아래 세 가지 중 하나라도 해당되면 `true`.

1. **속성 개수가 다르다**
   ```js
   node1.attributes.length !== node2.attributes.length
   ```
2. **같은 이름의 속성인데 값이 다르다**
   - `node1`의 속성을 순회하며 `getAttribute(name)` 값을 양쪽에서 비교
   - `attributes`도 유사 배열이므로 `Array.from()`으로 감싸 `find`를 쓴다
   - 1번에서 개수가 같음이 보장되므로, 한쪽만 순회해도 충분하다
3. **양쪽 다 자식 요소가 없는 리프 노드인데 텍스트가 다르다**
   ```js
   node1.children.length === 0 && node2.children.length === 0
     && node1.textContent !== node2.textContent
   ```
   - **리프일 때만** `textContent`를 비교해야 한다.
     자식이 있는 노드의 `textContent`는 하위 텍스트를 전부 합친 값이라,
     이걸 비교하면 하위 한 글자만 바뀌어도 상위 트리 전체가 교체되어 diff가 무의미해진다.

위 어디에도 해당하지 않으면 `false` (변경 없음 → 자식으로 내려감).

---

## 5. 충족해야 할 요구사항 체크리스트

- [ ] real만 있으면 노드를 제거한다
- [ ] virtual만 있으면 `parentNode`에 추가한다
- [ ] 변경 판정 시 `replaceWith`로 교체하고 하위 재귀를 중단한다
- [ ] 변경이 없으면 자식들로 재귀한다
- [ ] 자식 개수가 다를 때 `Math.max`로 긴 쪽 기준 순회한다 (추가/삭제 처리)
- [ ] 재귀 시 부모로 `realNode`를 넘긴다
- [ ] 속성 개수 차이를 감지한다
- [ ] 속성 값 차이를 감지한다
- [ ] 리프 노드일 때만 `textContent`를 비교한다
- [ ] `attributes` / `children`은 `Array.from`으로 배열화해 다룬다
- [ ] `applyDiff`를 default export 한다

---

## 6. 사용 예시

```js
// index.js
const render = () => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root');       // 현재 실제 DOM
    const newMain = registry.renderRoot(main, state, events); // 새 가상 트리
    applyDiff(document.body, main, newMain);
  });
};
```

- `renderRoot`가 `main`을 복제해서 새 트리를 만들었기 때문에,
  `main`은 여전히 실제 DOM에 붙어 있고 `newMain`은 떠 있는 상태다.
  이 둘을 비교하는 것이 전제 조건이다.

---

## 7. 한계 / 주의사항 (의도적으로 단순한 알고리즘임)

- **키(key) 개념이 없다.** 자식을 **인덱스로만** 짝짓기 때문에,
  리스트 맨 앞에 항목 하나가 추가되면 그 뒤 모든 노드가 "변경됨"으로 판정되어
  줄줄이 교체된다. React의 `key` prop이 해결하는 문제를 여기서는 다루지 않는다.
- **텍스트 노드를 직접 다루지 않는다.** `children`은 Element만 담기므로
  (`childNodes`가 아님) 요소 사이에 섞인 순수 텍스트 노드는 diff 대상이 아니다.
  리프의 `textContent` 비교로 간접 처리될 뿐이다.
- **DOM 프로퍼티는 비교하지 않는다.** `input.value`, `checked` 같은 것은 속성(attribute)이
  아니라 프로퍼티(property)라 `attributes` 비교에 잡히지 않는다.
- **`realNode`와 `virtualNode`의 인자 순서에 주의.** (3)에서 `isNodeChanged(virtualNode, realNode)`로
  가상 노드를 먼저 넘긴다. 판정 자체는 대칭적이라 결과는 같지만, 속성 순회 기준이
  가상 노드 쪽이 된다.
- 최초 렌더에서도 `main`과 `newMain`이 이미 존재하므로 (2) 경로는 잘 타지 않고,
  주로 하위 리스트의 증감에서 (1)/(2)가 발동한다.

---

## 8. 관련 파일

- [registry.md](registry.md) — 비교 대상인 새 트리를 만들어내는 렌더링 엔진
- [index.md](index.md) — 두 모듈을 엮어 렌더 루프를 구성하는 진입점
