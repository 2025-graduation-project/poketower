# 포켓타워 클라이언트

이 프로젝트는 Wails 프레임워크를 기반으로 개발된 포켓몬스터 팬게임입니다. 클라이언트는 Vite, React, TypeScript를 사용하여 제작되었습니다.

## 소개

포켓타워는 포켓몬스터의 배틀타워 형식을 모티브로 한 게임입니다. 플레이어는 점점 더 강력해지는 상대와의 배틀을 통해 타워를 올라가며, 각 층을 클리어할 때마다 다양한 보상을 획득할 수 있습니다.

## 주요 기술 스택
- **Wails**
- **Vite**
- **React**
- **TypeScript**

## 폴더 구조
- `frontend/` : 프론트엔드 소스 (Vite + React + TypeScript)
- `build/` : 빌드 및 리소스 파일
- `frontend/wailsjs/` : Wails에서 자동 생성된 JS/TS 파일
- `service/` : 백엔드 소스(Go)
- `main.go`, `app.go` : Go 기반 백엔드 진입점

## 실행 방법

1. 의존성 설치
   - 프론트엔드: `cd frontend && pnpm install`
   - 백엔드: `go mod tidy`
2. 개발 서버 실행
   - `wails dev`
   - `cd frontend && pnpm run dev`
3. 빌드
   - `wails build`

## 개발 목적

이 프로젝트는 2인 팀이 졸업프로젝트로 개발 중인 게임입니다. 현재는 오픈소스가 아니며, 향후 오픈소스로 전환될 수 있습니다.

## 라이선스

본 프로젝트는 비상업적 팬게임으로, 공식 포켓몬스터와는 무관합니다. 만약 포켓몬스터 측의 요청이 있을 경우, 즉시 프로젝트를 내릴 예정입니다.

---

## License (English)

This project is a non-commercial fan game and is not affiliated with the official Pokémon franchise. If requested by the Pokémon rights holders, the project will be taken down immediately.

