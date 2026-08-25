# view/todos.js 명세서

할 일 **목록(`<ul>`)** 을 그리는 컴포넌트. 삭제 이벤트를 처리한다.

---

## 1. 책임

1. `#todo-item` template으로 할 일 하나짜리 `<li>`를 만든다
2. `state.todos` 배열 전체를 `<li>` 목록으로 렌더링한다
3. 삭제 버튼 클릭을 **이벤트 위임**으로 처리한다

---

## 2. 시그니처

```js
(targetElement, state, events) => HTMLElement
```

- `state`에서 **`todos`** 를 사용한다.
- `events`에서 **`deleteItem`** 을 사용한다.
- 반환: `<li>`들이 채워진 새 `<ul>`

---

## 3. 핵심 동작

### (1) template 캐싱 + 복제 (`createNewTodoNode`)
```js
let template;
const createNewTodoNode = () => {
  if (!template) template = document.getElementById('todo-item');
  return template.content.firstElementChild.cloneNode(true);
};
```
- `app.js`와 동일한 패턴: 참조는 캐싱, 반환은 매번 새 복제본.

### (2) 할 일 하나 → DOM 변환 (`getTodoElement(todo, index)`)
```js
element.querySelector('input.edit').value = text;   // 편집용 input에 값
element.querySelector('label').textContent = text;  // 표시용 label에 텍스트

if (completed) {
  element.classList.add('completed');                    // CSS가 취소선 처리
  element.querySelector('input.toggle').checked = true;  // 체크박스 on
}

element.querySelector('button.destroy').dataset.index = index;  // 삭제용 인덱스 심기
```
- **텍스트를 두 군데(`input.edit`, `label`)에 넣는다.** TodoMVC의 보기/편집 모드 구조 때문.
- `completed`일 때만 클래스와 체크 상태를 켠다. (복제본은 항상 초기 상태이므로 끄는 처리는 불필요)
- **`dataset.index`에 배열 인덱스를 심는 것이 핵심.** 나중에 위임된 클릭 핸들러가
  "어떤 항목이 눌렸는지" 알아내는 유일한 수단이다.
- **`textContent`를 쓰고 `innerHTML`을 쓰지 않는다.** XSS 방지.

### (3) 목록 렌더링
```js
const newTodoList = targetElement.cloneNode(true);
newTodoList.innerHTML = '';
todos.map((todo, index) => getTodoElement(todo, index))
     .forEach((element) => newTodoList.appendChild(element));
```
- 대상 복제 → 비우기 → 전부 다시 채우기. (부분 갱신은 `applyDiff`의 몫)
- `ul.todo-list` 껍데기와 `data-component="todos"` 속성이 유지된다.

### (4) 이벤트 위임
```js
newTodoList.addEventListener('click', (e) => {
  if (e.target.matches('button.destroy')) {
    deleteItem(e.target.dataset.index);
  }
});
```
- **`<li>` 하나하나가 아니라 `<ul>` 하나에만 리스너를 단다.**
  할 일이 100개여도 리스너는 1개 → 메모리/성능 이점.
- `e.target.matches('button.destroy')`로 실제 클릭 대상을 판별한다.
  (버튼이 아닌 곳을 눌렀을 때 아무 일도 안 일어나게 하는 가드)
- 리스너는 **복제본에** 붙인다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] template 참조를 캐싱하되 매번 새 복제본을 반환한다
- [ ] `input.edit`의 `value`와 `label`의 `textContent`에 모두 텍스트를 넣는다
- [ ] `completed`일 때 `completed` 클래스와 `toggle` 체크를 켠다
- [ ] `button.destroy`의 `dataset.index`에 배열 인덱스를 심는다
- [ ] `innerHTML` 대신 `textContent`를 쓴다 (XSS 방지)
- [ ] `targetElement` 복제 → 비우기 → 전체 재구성 순서를 지킨다
- [ ] 리스너를 `<li>`마다가 아니라 `<ul>` 하나에 위임한다
- [ ] `matches`로 클릭 대상을 판별한 뒤에만 `deleteItem`을 호출한다
- [ ] 이벤트를 복제본에 연결한다

---

## 5. 주의사항 / 알려진 한계

- **`dataset.index`는 문자열이다.** `deleteItem`에 `"2"` 같은 문자열이 넘어간다.
  `splice`는 알아서 변환하지만, 엄격히 하려면 `Number(...)` 처리가 필요하다.
- **인덱스 기반 식별의 취약점.** 항목이 삭제/재정렬되면 인덱스가 밀린다.
  `applyDiff`에 key 개념이 없는 것과 같은 뿌리의 한계다. 고유 id 도입이 정석.
- **토글(완료 표시)과 편집(더블클릭) 이벤트가 아직 미구현이다.**
  `input.toggle`은 화면에 상태를 보여줄 뿐 클릭해도 상태가 안 바뀌고,
  `input.edit`도 채워져 있지만 편집 모드 진입 로직이 없다.
- `checked`는 프로퍼티라 `applyDiff`의 속성 비교에 잡히지 않는다.
  다만 `completed` 클래스(속성)가 같이 바뀌므로 노드 교체는 정상적으로 일어난다.

---

## 6. 관련 파일

- [../index.md](../index.md) — `deleteItem` 정의처, `state.todos` 소유자
- [../index.html.md](../index.html.md) — `#todo-item` template 정의
- [../applyDiff.md](../applyDiff.md) — 이 목록의 증감을 실제 DOM에 반영
