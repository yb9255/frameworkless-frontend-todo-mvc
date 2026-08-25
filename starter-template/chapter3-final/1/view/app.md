# view/app.js 명세서

앱 전체 골격을 그리는 **최상위 컴포넌트**. 새 할 일 입력을 받는다.

---

## 1. 책임

1. `#todo-app` template을 복제해 앱 전체 마크업을 만든다
2. 새 할 일 입력창(`.new-todo`)에 키보드 이벤트를 연결한다
3. 그 안에 들어 있는 하위 컴포넌트 자리표시자를 그대로 노출한다
   → 레지스트리가 이어서 `todos`/`counter`/`filters`를 채운다

---

## 2. 시그니처

```js
(targetElement, state, events) => HTMLElement
```

- `state`는 **사용하지 않는다.** (하위로 전달되기만 함)
- `events`에서 **`addItem`** 을 사용한다.
- 반환: 앱 마크업이 채워진 새 요소

---

## 3. 핵심 동작

### (1) template 캐싱
```js
let template;
const getTemplate = () => {
  if (!template) template = document.getElementById('todo-app');
  return template.content.firstElementChild.cloneNode(true);
};
```
- `template` 참조를 **모듈 스코프에 한 번만 캐싱**한다. (매 렌더마다 DOM 조회 방지)
- 단, **반환은 매번 새 복제본**이어야 한다. 캐싱하는 건 template 요소 자체이지
  복제된 결과가 아니다. 이걸 헷갈리면 같은 노드를 재사용해 버그가 난다.
- `content.firstElementChild`로 template 안의 유일한 최상위 요소(`section.todoapp`)를 꺼낸다.

### (2) 대상 요소 복제 후 내용 교체
```js
const newApp = targetElement.cloneNode(true);
newApp.innerHTML = '';
newApp.appendChild(getTemplate());
```
- **`targetElement`를 직접 건드리지 않는다.** 복제본을 만들어 반환하는 것이 컴포넌트 계약.
- `innerHTML = ''`로 비우는 이유: `targetElement`는 이전 렌더 결과(앱 전체 마크업)일 수도
  있으므로, 비우지 않으면 template이 중복 삽입된다.
- 껍데기(`div[data-component="app"]`)는 유지되고 그 안이 통째로 교체된다.
  → 다음 렌더에서도 `data-component="app"` 속성이 살아 있어야 하므로 껍데기를 버리면 안 된다.

### (3) 이벤트 연결
```js
targetElement.querySelector('.new-todo').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    events.addItem(e.target.value);
    e.target.value = '';
  }
});
```
- **반드시 `appendChild` 이후에** 호출해야 한다. 그 전에는 `.new-todo`가 없다.
- `keypress`에서 `e.key === 'Enter'` 인지 확인 → Enter일 때만 처리
- `events.addItem(값)` 호출 후 **입력창을 직접 비운다** (`e.target.value = ''`)
- 이벤트는 **복제본(`newApp`)에** 붙인다. 원본에 붙이면 화면에 반영되지 않는다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] template 참조를 모듈 스코프에 캐싱하되, 매번 새 복제본을 반환한다
- [ ] `targetElement`를 복제해 사용하고 원본을 변형하지 않는다
- [ ] 복제본을 `innerHTML = ''`로 비운 뒤 template을 붙인다 (중복 삽입 방지)
- [ ] `data-component="app"` 껍데기 요소를 유지한다
- [ ] template 삽입 **이후에** 이벤트를 연결한다
- [ ] Enter 키일 때만 `events.addItem`을 호출한다
- [ ] 호출 후 입력창 값을 비운다
- [ ] 이벤트를 복제본에 연결한다
- [ ] 하나의 HTMLElement를 반환한다

---

## 5. 주의사항

- **빈 문자열 검증이 없다.** 아무것도 입력하지 않고 Enter를 치면 빈 할 일이 추가된다.
  개선하려면 `if (e.target.value.trim())` 가드를 넣는다.
- **`keypress`는 deprecated 이벤트다.** 현대 코드라면 `keydown`을 쓰는 게 맞다.
- **입력 중인 값이 렌더 때마다 날아갈 수 있다.** `value`는 속성이 아니라 프로퍼티라
  `applyDiff`가 감지하지 못하지만, 노드가 교체되면 사라진다. (제어 컴포넌트가 아닌 구조의 한계)
- 매 렌더마다 새 노드에 이벤트를 새로 붙이므로 리스너 중복 문제는 없지만,
  포커스는 유지되지 않는다.

---

## 6. 관련 파일

- [../index.md](../index.md) — `addItem` 정의처
- [../index.html.md](../index.html.md) — `#todo-app` template 정의
- [../registry.md](../registry.md) — 이 컴포넌트를 실행하고 하위를 이어 채우는 엔진
