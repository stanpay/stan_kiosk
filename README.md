# Stan Kiosk

기존 [`stan_web_reference`](./stan_web_reference)를 기반으로 한 새로운 키오스크 프로그램입니다.

시안을 위한 프로토타입 개발을 진행 중이며, 실제 개발은 이후 다시 진행할 예정입니다.  
따라서 본 프로젝트에서는 API·데이터·결제 등을 **적절히 목업(mock)** 으로 구성합니다.

참고용 기존 웹사이트는 `stan_web_reference/` 를 확인하세요. (로컬 참고용, gitignore 처리됨)

## 기술 스택

- React 18 · TypeScript · Vite · Tailwind CSS

## 시작하기

```bash
npm install
npm run dev
```

개발 서버는 http://localhost:5173 에서 실행됩니다.

### 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | 타입 검사 |
| `npm run lint` | 린트 |
