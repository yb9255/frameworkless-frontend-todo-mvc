# view/counter.js 명세서

남은 할 일 **개수를 표시**하는 컴포넌트. 가장 단순한 순수 표시용 뷰다.

---

## 1. 책임

`state.todos` 중 완료되지 않은 항목 수를 세어 `"N Items left"` 문자열로 표시한다.
이벤트를 다루지 않는다.

---

## 2. 시그니처

```js
(targetElement, { todos }) => HTMLElement
```

- **두 번째 인자를 구조분해로 받는다** — `state` 전체가 아니라 `todos`만 꺼내 쓴다.
  이 컴포넌트가 상태의 어느 부분에 의존하는지 시그니처만 봐도 드러난다.
- **`events`를 아예 받지 않는다.** 이벤트가 필요 없는 컴포넌트는 인자를 생략해도
  레지스트리 계약을 위반하지 않는다. (JS는 여분 인자를 무시)
- 반환: 텍스트가 갱신된 새 요소

---

## 3. 핵심 동작

### (1) 개수 세기 + 문자열 만들기 (`getTodoCount`)
```js
const notCompleted = todos.filter((todo) => !todo.completed);
const { length } = notCompleted;
if (length === 1) return '1 Item left';
return `${length} Items left`;
```
- **완료되지 않은 것만** 센다 (`!todo.completed`). 전체 개수가 아니다.
- **단수/복수 처리가 필수 요구사항이다.**
  - `1` → `"1 Item left"` (단수)
  - 그 외(0 포함) → `"N Items left"` (복수)
  - `0`은 복수형 `"0 Items left"`가 맞다. 영어 문법상 0은 복수 취급.
- 문자열 조립 로직을 별도 함수로 분리해 두면 테스트하기 쉽다.

### (2) 복제 후 텍스트 설정
```js
const newCounter = targetElement.cloneNode(true);
newCounter.textContent = getTodoCount(todos);
return newCounter;
```
- 대상을 복제하고 `textContent`만 바꾼다. `innerHTML` 불필요.
- `span.todo-count` 껍데기와 `data-component="counter"` 속성이 유지된다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] 완료되지 않은 항목만 센다 (`!completed`)
- [ ] 개수가 1일 때 단수형 `"1 Item left"`를 반환한다
- [ ] 그 외에는 복수형 `"N Items left"`를 반환한다 (0 포함)
- [ ] `targetElement`를 복제해 사용하고 원본을 변형하지 않는다
- [ ] `textContent`로 텍스트를 설정한다
- [ ] 하나의 HTMLElement를 반환한다

---

## 5. 주의사항

- **대소문자와 공백까지 계약이다.** `"1 Item left"` — `Item`은 대문자 I,
  `left`는 소문자. 테스트가 문자열을 정확히 비교하므로 오타에 주의.
- `applyDiff` 기준으로 이 노드는 **리프 노드**라 `textContent` 비교가 그대로
  동작한다. 즉 개수가 바뀌면 정확히 이 span만 교체된다. (diff가 잘 먹는 이상적 케이스)
- 필터가 적용돼도 카운터는 **항상 전체 미완료 개수**를 보여준다.
  `currentFilter`에 의존하지 않는 것이 의도된 동작이다. (TodoMVC 명세)

---

## 6. 관련 파일

- [../index.md](../index.md) — `state.todos` 소유자
- [../applyDiff.md](../applyDiff.md) — 리프 노드 텍스트 비교로 이 요소를 갱신
