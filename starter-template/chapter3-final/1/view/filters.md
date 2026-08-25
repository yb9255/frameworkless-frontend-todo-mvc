# view/filters.js 명세서

필터 링크(All / Active / Completed) 중 **현재 선택된 것을 표시**하는 컴포넌트.

---

## 1. 책임

`state.currentFilter` 값과 일치하는 링크에만 `selected` 클래스를 붙이고,
나머지에서는 제거한다. 링크 자체를 생성하지는 않는다.

---

## 2. 시그니처

```js
(targetElement, { currentFilter }) => HTMLElement
```

- `state`에서 **`currentFilter`** 만 구조분해로 꺼내 쓴다.
- **`events`를 받지 않는다.** 클릭 처리는 (아직) 하지 않는다.
- 반환: 클래스가 갱신된 새 요소

---

## 3. 핵심 동작

### (1) 복제
```js
const newCounter = targetElement.cloneNode(true);
```
- **링크 3개는 이미 `index.html`에 들어 있다.** 이 컴포넌트는 그걸 복제해 재사용할 뿐,
  `<li><a>`를 만들지 않는다. → `todos.js`와 정반대 전략이다.
  (목록은 데이터에서 생성, 필터는 마크업에 고정)

### (2) 선택 상태 토글
```js
Array.from(newCounter.querySelectorAll('li a')).forEach((a) => {
  if (a.textContent === currentFilter) {
    a.classList.add('selected');
  } else {
    a.classList.remove('selected');
  }
});
```
- **`li a` 셀렉터로 모든 링크를 찾는다.**
- **`a.textContent`와 `currentFilter`를 문자열로 직접 비교한다.**
  → `state.currentFilter`의 값(`'All'`)이 HTML의 링크 텍스트(`All`)와
  **대소문자·공백까지 정확히 일치**해야 한다. 이것이 이 컴포넌트의 핵심 계약이다.
- **`else`에서 `remove`를 반드시 해야 한다.** 복제본이 이전 렌더 결과라면
  옛 선택이 남아 있을 수 있어, 추가만 하고 제거를 빼면 선택이 두 개가 된다.
- `selected` 클래스는 TodoMVC CSS가 정의한 이름이다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] `targetElement`를 복제해 사용하고 원본을 변형하지 않는다
- [ ] 링크를 새로 만들지 않고 기존 `li a`를 찾아 쓴다
- [ ] `textContent`와 `currentFilter`를 비교해 일치하는 링크에 `selected`를 추가한다
- [ ] 일치하지 않는 링크에서는 `selected`를 제거한다 (누락 시 다중 선택 버그)
- [ ] `querySelectorAll` 결과를 `Array.from`으로 배열화해 순회한다
- [ ] 하나의 HTMLElement를 반환한다

---

## 5. 주의사항 / 알려진 한계

- **클릭 이벤트가 미구현이다.** 링크의 `href="#/active"` 덕분에 URL 해시는 바뀌지만,
  `state.currentFilter`를 바꾸는 코드가 없어 화면은 반응하지 않는다.
  완성하려면 `index.js`에 `changeFilter` 이벤트를 추가하고 이 컴포넌트에서
  클릭(또는 `hashchange`)을 연결해야 한다.
- **필터가 목록에 실제로 적용되지 않는다.** `todos.js`는 `currentFilter`를 보지 않고
  항상 전체를 그린다. 필터링 로직도 함께 구현해야 기능이 완성된다.
- **텍스트 비교는 다국어에 취약하다.** 링크 텍스트를 번역하면 즉시 깨진다.
  견고하게 하려면 `data-filter="All"` 같은 속성으로 비교하는 편이 낫다.
- 변수명이 `newCounter`인데 이는 `counter.js`에서 복사해온 흔적이다.
  `newFilters` 등이 더 적절하다. (동작에는 영향 없음)

---

## 6. 관련 파일

- [../index.md](../index.md) — `state.currentFilter` 소유자
- [../index.html.md](../index.html.md) — 필터 링크 3개가 정의된 곳
- [counter.md](counter.md) — 동일한 "복제 후 최소 변경" 패턴
