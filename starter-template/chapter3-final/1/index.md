# index.js 명세서

애플리케이션 **진입점(entry point)**. 컴포넌트 등록, 상태 보관, 이벤트 정의,
렌더 루프 구동을 담당한다. 처음부터 다시 구현할 때 충족해야 할 요구사항 문서다.

---

## 1. 책임 (이 파일이 하는 일)

이 파일은 **애플리케이션의 유일한 "가변 상태" 소유자**이자 오케스트레이터다.
다른 모든 모듈(레지스트리, 뷰, diff)은 순수 함수에 가깝고, 여기서만 상태가 바뀐다.

1. 뷰 컴포넌트들을 레지스트리에 **등록**한다
2. 애플리케이션 **상태(state)** 를 보관한다
3. 상태를 바꾸는 **이벤트 핸들러(events)** 를 정의한다
4. 상태 → DOM 을 그리는 **렌더 루프(render)** 를 정의하고 최초 1회 실행한다

---

## 2. 필수 구성 요소 (5단계)

### (1) 컴포넌트 등록
```js
registry.add('app', appView);
registry.add('todos', todosView);
registry.add('counter', counterView);
registry.add('filters', filtersView);
```
- 등록하는 **이름은 `index.html`의 `data-component` 속성 값과 정확히 일치**해야 한다.
- **첫 `render()` 호출 이전에** 모두 등록되어야 한다. 등록 안 된 이름은 조용히 무시되므로
  누락 시 에러 없이 그냥 화면에 안 나온다. (디버깅 시 가장 먼저 의심할 곳)

### (2) 상태 정의
```js
const state = {
  todos: [],
  currentFilter: 'All',
};
```
- 애플리케이션 전체 상태를 담는 **단일 객체**.
- 각 뷰는 이 객체에서 자기가 필요한 것만 구조분해로 꺼내 쓴다.
  → 뷰가 기대하는 키 이름(`todos`, `currentFilter`)과 반드시 맞아야 한다.

### (3) 이벤트 정의
```js
const events = {
  deleteItem: (index) => { state.todos.splice(index, 1); render(); },
  addItem: (text) => { state.todos.push({ text, completed: false }); render(); },
};
```
- **핵심 규칙: 모든 핸들러는 `상태 변경` → `render()` 호출 순서를 지킨다.**
  상태만 바꾸고 렌더를 안 부르면 화면이 갱신되지 않는다. (수동 렌더링 모델)
- 뷰는 DOM만 알고 상태는 모른다. 상태를 만지는 코드가 여기 한 곳에 모이는 것이 이 구조의 핵심.
- `events` 객체의 **키 이름은 각 뷰가 구조분해로 꺼내 쓰는 이름과 일치**해야 한다.
  (`todos.js`는 `deleteItem`을, `app.js`는 `addItem`을 기대한다)

### (4) 렌더 루프
```js
const render = () => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root');
    const newMain = registry.renderRoot(main, state, events);
    applyDiff(document.body, main, newMain);
  });
};
```
- **`requestAnimationFrame`으로 감싼다.** 브라우저의 다음 페인트 직전에 DOM을 만지므로
  레이아웃 스래싱을 줄이고, 한 프레임 안의 연속 호출을 자연히 정리한다.
- **`main`을 매번 새로 `querySelector` 한다.** `applyDiff`가 노드를 교체할 수 있어
  이전에 잡아둔 참조는 낡을 수 있기 때문이다. 바깥에 캐싱해두면 안 된다.
- `renderRoot`가 `main`의 복제본으로 새 트리를 만들고, `applyDiff`가 그 차이만 반영한다.

### (5) 최초 실행
```js
render();
```
- 초기 상태로 첫 화면을 그린다. 이게 없으면 빈 `#root`만 남는다.

---

## 3. 데이터 흐름 (단방향)

```
        [state]
           │  (읽기)
           ▼
   registry.renderRoot ──► 새 DOM 트리
           │                   │
      [events] 주입             ▼
           │              applyDiff ──► 실제 DOM 갱신
           │                                │
           └──────── 사용자 입력 ◄───────────┘
                         │
                (state 변경 + render() 재호출)
```

- 상태는 **아래로만** 흐르고(`state` 주입), 변경 요청은 **콜백으로만 위로** 올라온다(`events`).
- 이 규칙이 지켜지면 뷰는 전부 테스트 가능한 순수 함수가 된다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] 필요한 뷰/모듈을 모두 import 한다 (`registry`, `applyDiff`, 각 view)
- [ ] 첫 렌더 전에 모든 컴포넌트를 `registry.add`로 등록한다
- [ ] 등록 이름이 `index.html`의 `data-component` 값과 일치한다
- [ ] 단일 `state` 객체를 정의한다 (`todos`, `currentFilter`)
- [ ] `events` 객체를 정의하고, 각 핸들러가 상태 변경 후 `render()`를 호출한다
- [ ] `events` 키 이름이 각 뷰가 기대하는 이름과 일치한다
- [ ] `render`가 `requestAnimationFrame`으로 감싸져 있다
- [ ] `render` 안에서 `#root`를 매번 새로 조회한다
- [ ] `renderRoot` 결과를 `applyDiff`로 반영한다 (통째 교체 X)
- [ ] 마지막에 `render()`를 최초 1회 호출한다

---

## 5. 주의사항 / 알려진 한계

- **상태를 직접 변형(mutate)한다.** `splice`, `push`를 그대로 쓰므로 불변성이 없다.
  덕분에 코드는 짧지만, 이전 상태와 비교하거나 되돌리는(undo) 기능은 불가능하다.
- **`deleteItem(index)`의 index는 문자열이다.** `dataset.index`에서 오기 때문.
  `splice`는 알아서 숫자로 변환해주지만, 다른 곳에서 쓸 땐 `Number()` 변환이 필요하다.
- **`currentFilter`를 바꾸는 이벤트가 아직 없다.** `filters` 뷰는 이미 이 값을 읽어
  선택 표시를 하지만, 링크 클릭을 상태로 연결하는 핸들러는 미구현 상태다.
- **`state`와 `events`가 모듈 스코프의 전역이다.** 규모가 커지면 상태 관리 모듈
  (Observable/Store 패턴)로 분리해야 한다.
- 이벤트 핸들러가 렌더마다 새로 등록되지만, `renderRoot`가 매번 새 노드를 만들고
  `applyDiff`가 교체하므로 중복 등록 문제는 발생하지 않는다.

---

## 6. 관련 파일

- [registry.md](registry.md) — 컴포넌트 등록/렌더링 엔진
- [applyDiff.md](applyDiff.md) — 실제 DOM 반영 diff
- [index.html.md](index.html.md) — 마운트 지점과 템플릿 정의
- [view/app.md](view/app.md), [view/todos.md](view/todos.md), [view/counter.md](view/counter.md), [view/filters.md](view/filters.md)
