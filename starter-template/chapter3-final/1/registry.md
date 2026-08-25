# registry.js 명세서

프레임워크 없이 컴포넌트 기반 렌더링을 구현하는 **컴포넌트 레지스트리**.
처음부터 다시 구현할 때 충족해야 할 요구사항을 정리한 문서다.

---

## 1. 목적 (무엇을 하는가)

- 여러 개의 **컴포넌트 함수**를 이름(name)으로 등록해두고,
- DOM 트리를 렌더링할 때 `data-component` 속성이 붙은 요소를 발견하면
- 등록된 컴포넌트로 **자동 치환(교체)** 해주는 렌더링 엔진이다.
- 개발자는 `document.querySelector`로 직접 자식을 찾아 갈아끼우지 않아도 되고,
  마크업에 `data-component="이름"`만 선언하면 재귀적으로 렌더링이 이뤄진다.

---

## 2. 컴포넌트 함수의 계약 (규약)

레지스트리에 등록되거나 렌더링에 쓰이는 **모든 컴포넌트는 아래 시그니처를 따라야 한다.**

```js
(targetElement, state, events) => HTMLElement
```

- **입력**
  - `targetElement`: 이 컴포넌트가 렌더링될 대상 DOM 요소 (자리표시자)
  - `state`: 렌더링에 필요한 애플리케이션 상태 (읽기 전용으로 취급)
  - `events`: 컴포넌트가 사용자 입력에 반응해 호출할 콜백 묶음
- **출력**
  - 반드시 **하나의 HTMLElement**를 반환해야 한다. (문자열/배열 X)
- **부작용**
  - 컴포넌트는 상태를 직접 바꾸지 않는다. 변경은 반드시 `events`의 콜백을 통해서만.
  - `targetElement`를 직접 변형하지 말고 `cloneNode(true)` 후 복제본을 반환한다.

---

## 3. 공개 API (반드시 제공해야 하는 것)

모듈은 아래 두 함수를 담은 객체를 **default export** 해야 한다.

### `add(name, component)`
- 컴포넌트를 이름과 함께 레지스트리에 등록한다.
- `name`: `data-component` 속성 값과 매칭될 문자열 키
- `component`: 2절의 계약을 따르는 컴포넌트 함수
- 등록 시 컴포넌트를 그대로 저장하는 게 아니라 **자식 렌더링 능력을 입힌 래퍼**로
  감싸서 저장해야 한다. (4절 참고)

### `renderRoot(root, state, events)`
- 최상위 루트 요소부터 렌더링을 시작한다.
- 반환값: 완성된(자식까지 모두 치환된) 새 DOM 트리
- **중요: 원본 `root`를 직접 변형하지 말 것.** `cloneNode(true)`로 복제한 뒤
  복제본을 렌더링해야 한다. (원본을 실제 DOM에 남겨두고 diff 대상으로 써야 하므로)
- 즉 `renderRoot`는 "아무것도 안 하고 복제만 하는 컴포넌트"를 래퍼에 통과시키는 것과 같다.

---

## 4. 핵심 동작: 재귀적 자식 렌더링 (가장 중요)

`add`로 등록될 때든 `renderRoot`로 시작할 때든, 렌더링 로직은 아래를 수행해야 한다.

1. 컴포넌트 함수를 `(targetElement, state, events)`로 실행해 결과 element를 얻는다.
2. 그 element 내부에서 `[data-component]` 속성을 가진 모든 자식 요소를 찾는다.
   - `element.querySelectorAll('[data-component]')` 사용
3. 각 자식에 대해:
   - `target.dataset.component` 값으로 레지스트리에서 해당 컴포넌트를 조회한다.
   - **등록되지 않은 이름이면 조용히 건너뛴다** (에러 던지지 않음, `return`).
   - 등록돼 있으면 그 자식 요소를 대상으로 컴포넌트를 실행하고
     `target.replaceWith(...)`로 **원래 자리에 치환**한다.
   - 이때 `state`와 `events`를 **그대로 아래로 전파**한다.
4. 최종 element를 반환한다.

> 이 "실행 → 자식 탐색 → 치환" 로직은 `add`와 `renderRoot` **양쪽에서 공유**되어야 하므로,
> 별도의 래퍼 함수(예: `renderWrapper`)로 추출해 재사용하는 것이 핵심 설계 포인트다.

### 재귀가 성립하는 이유
`add`로 등록된 컴포넌트는 이미 래퍼로 감싸져 있다. 따라서 3번에서 자식을 실행하는 순간
그 자식도 다시 "자기 자식 탐색 → 치환"을 수행한다. 명시적 재귀 호출 없이
**등록 시점의 래핑만으로 트리 전체가 처리된다.**

---

## 5. 충족해야 할 요구사항 체크리스트

- [ ] 컴포넌트를 이름으로 등록할 수 있다 (`add`)
- [ ] 루트부터 렌더링을 시작할 수 있다 (`renderRoot`)
- [ ] `add`와 `renderRoot`가 동일한 렌더링 래퍼 로직을 공유한다
- [ ] `data-component` 속성을 기준으로 자식을 자동 탐색한다
- [ ] 자식이 재귀적으로 렌더링된다 (자식의 자식도 처리됨)
- [ ] 등록되지 않은 컴포넌트 이름은 에러 없이 무시된다
- [ ] `renderRoot`는 원본 root를 변형하지 않고 복제본을 사용한다
- [ ] `state`와 `events`가 모든 하위 컴포넌트까지 그대로 전파된다
- [ ] 모듈은 `{ add, renderRoot }`를 default export 한다

---

## 6. 사용 예시 (기대 동작)

```js
// index.js
import registry from './registry.js';

registry.add('app', appView);
registry.add('todos', todosView);
registry.add('counter', counterView);
registry.add('filters', filtersView);

const main = document.querySelector('#root');
const newMain = registry.renderRoot(main, state, events);
```

```html
<!-- index.html: 마크업에 자리표시자만 선언 -->
<div id="root">
  <div data-component="app"></div>
</div>
```

- `renderRoot` 실행 시 `data-component="app"` 자리에 `appView` 결과가 채워지고,
  그 안의 `data-component="todos" | "counter" | "filters"`도 연쇄적으로 채워져야 한다.

---

## 7. 엣지 케이스 / 주의사항

- `querySelectorAll` 결과는 **NodeList(유사 배열)** 이므로 `Array.from()`으로 감싸
  순회하는 것이 안전하다. `replaceWith`로 노드를 교체하면 순회 중인 요소가 DOM에서
  빠지지만, 이미 스냅샷을 떠뒀다면 순회에는 영향이 없다.
- `querySelectorAll`은 **루트 자신은 포함하지 않는다.** 그래서 `renderRoot`에 넘기는
  요소는 `data-component`를 가진 요소가 아니라 그것을 **감싸는 컨테이너**여야 한다.
  (`#root` > `div[data-component="app"]` 구조인 이유)
- 이 레지스트리는 상태를 관리하지 않는다. 상태 변경/재렌더링 트리거는 이 모듈 밖
  (`events` 콜백 → `render()` 재호출)에서 담당한다.
- 레지스트리는 모듈 스코프의 단일 객체(싱글턴)다. 같은 이름으로 다시 `add`하면 덮어쓴다.

---

## 8. 관련 파일

- [index.md](index.md) — 레지스트리에 컴포넌트를 등록하고 렌더 루프를 구동하는 진입점
- [applyDiff.md](applyDiff.md) — `renderRoot` 결과를 실제 DOM에 반영하는 diff 알고리즘
