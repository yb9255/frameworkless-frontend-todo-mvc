# index.html 명세서

애플리케이션의 **HTML 껍데기**. 마운트 지점, 컴포넌트 자리표시자,
그리고 JS가 복제해 쓸 `<template>` 정의를 담당한다.

---

## 1. 책임 (이 파일이 하는 일)

이 구조에서 HTML은 "초기 화면"이 아니라 **재료 창고 + 조립 설명서**다.

1. 외부 CSS/스크립트를 로드한다
2. JS가 `cloneNode`해서 쓸 **`<template>`** 들을 정의한다
3. 렌더링이 시작될 **마운트 지점(`#root`)** 과 최상위 컴포넌트 자리를 선언한다
4. 진입점 스크립트를 **ES 모듈로** 로드한다

---

## 2. 필수 구성 요소

### (1) `<head>` — 외부 리소스
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/todomvc-common@1.0.5/base.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/todomvc-app-css@2.1.2/index.css">
```
- TodoMVC 공식 CSS. **뷰 코드가 쓰는 클래스명(`todoapp`, `todo-list`, `completed`,
  `selected`, `new-todo` 등)은 이 CSS가 정의한 것**이므로 임의로 바꾸면 스타일이 깨진다.
- 즉 클래스명은 단순 장식이 아니라 **외부 CSS와의 계약**이다.

### (2) `<template id="todo-item">` — 할 일 한 개의 골격
```html
<template id="todo-item">
  <li>
    <div class="view">
      <input class="toggle" type="checkbox">
      <label></label>
      <button class="destroy"></button>
    </div>
    <input class="edit">
  </li>
</template>
```
- `todos.js`가 `getElementById('todo-item')` → `content.firstElementChild.cloneNode(true)`로 복제한다.
- **`firstElementChild`를 꺼내므로 template 안의 최상위 요소는 정확히 하나여야 한다.** (여기선 `<li>`)
- 내부 요소는 뷰가 셀렉터로 찾는다 → `input.edit`, `label`, `input.toggle`, `button.destroy`.
  **이 셀렉터들이 뷰 코드와의 계약**이라 구조를 바꾸면 `todos.js`도 같이 고쳐야 한다.

### (3) `<template id="todo-app">` — 앱 전체 골격
```html
<template id="todo-app">
  <section class="todoapp"> ... </section>
</template>
```
- `app.js`가 복제해 쓴다. 역시 최상위 요소는 하나(`section.todoapp`).
- 이 안에 **하위 컴포넌트 자리표시자**들이 들어 있다:
  ```html
  <ul class="todo-list" data-component="todos"></ul>
  <span class="todo-count" data-component="counter"></span>
  <ul class="filters" data-component="filters"> ...링크 3개... </ul>
  ```
- `filters`의 `<li><a>All</a></li>` 같은 링크는 **HTML에 미리 존재해야 한다.**
  `filters.js`는 링크를 만들지 않고 기존 `li a`를 찾아 `selected` 클래스만 토글하기 때문이다.
  링크 텍스트(`All`/`Active`/`Completed`)는 `state.currentFilter` 값과 **문자열이 정확히 일치**해야 한다.

### (4) 마운트 지점
```html
<div id="root">
  <div data-component="app"></div>
</div>
```
- **가장 중요한 구조적 요구사항.** `#root`는 `data-component`를 갖지 않는
  **바깥 컨테이너**이고, 그 안에 최상위 컴포넌트 자리가 따로 있어야 한다.
- 이유: `registry.renderRoot`는 `querySelectorAll('[data-component]')`로 자식을 찾는데,
  이 메서드는 **자기 자신을 결과에 포함하지 않는다.**
  `#root` 자체에 `data-component="app"`을 달면 아무것도 렌더링되지 않는다.

### (5) 스크립트 로드
```html
<script type="module" src="index.js"></script>
```
- **`type="module"` 필수.** `index.js`가 `import`를 쓰기 때문.
- 모듈 스크립트는 자동으로 defer되므로, 실행 시점에 위의 `<template>`과 `#root`가
  이미 파싱되어 있다. → `getElementById`/`querySelector`가 안전하게 동작한다.
- `<body>` 끝에 두는 것도 같은 이유로 안전하다.

---

## 3. 왜 `<template>` 인가

- `<template>`의 내용은 **파싱되지만 렌더링되지 않고, 스크립트도 실행되지 않는다.**
  즉 "보이지 않는 DOM 조각"을 HTML로 선언해둘 수 있다.
- 문자열 템플릿(`innerHTML = '...'`)과 비교했을 때:
  - 마크업이 HTML 파일에 남아 **에디터 하이라이팅/포맷팅이 살아 있다**
  - 매번 HTML을 파싱하지 않고 `cloneNode`만 하므로 **빠르다**
  - 문자열 조립이 없어 **XSS 위험이 줄어든다**
- 뷰 파일들이 `template` 참조를 모듈 스코프 변수에 **한 번만 캐싱**하는 것도
  이 구조를 전제로 한 최적화다.

---

## 4. 충족해야 할 요구사항 체크리스트

- [ ] TodoMVC CSS를 로드한다 (클래스명 계약 유지)
- [ ] `id="todo-item"` template을 정의하고, 최상위 요소가 하나뿐이다
- [ ] `id="todo-app"` template을 정의하고, 최상위 요소가 하나뿐이다
- [ ] 뷰가 쓰는 셀렉터(`input.edit`, `label`, `input.toggle`, `button.destroy`)가 존재한다
- [ ] `todos` / `counter` / `filters` 자리표시자에 `data-component`가 달려 있다
- [ ] `data-component` 값이 `index.js`의 `registry.add` 이름과 일치한다
- [ ] 필터 링크 3개가 HTML에 미리 존재하고, 텍스트가 `currentFilter` 값과 일치한다
- [ ] `#root`가 존재하고, **그 안에** `data-component="app"` 요소가 따로 있다
- [ ] `<script type="module" src="index.js">`로 진입점을 로드한다

---

## 5. 주의사항

- **`#root` 중첩 구조를 평평하게 만들지 말 것.** 4절 체크리스트 중 가장 놓치기 쉽고,
  틀렸을 때 에러 없이 조용히 빈 화면이 나오는 항목이다.
- `data-component` 값에 오타가 나도 **에러가 나지 않는다.** 레지스트리가 미등록 이름을
  조용히 무시하도록 설계됐기 때문. 화면 일부가 안 보이면 여기부터 확인한다.
- Faker CDN 스크립트가 로드되지만 현재 코드에서는 사용하지 않는다. (더미 데이터 생성용 잔재)
- `<html>`에 `lang` 속성, `<meta charset>`이 없다. 실제 서비스라면 추가해야 한다.

---

## 6. 관련 파일

- [index.md](index.md) — 여기서 로드되는 진입점
- [registry.md](registry.md) — `data-component`를 해석하는 렌더링 엔진
- [view/app.md](view/app.md) — `#todo-app` template 사용
- [view/todos.md](view/todos.md) — `#todo-item` template 사용
