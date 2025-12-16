# 문서 디렉토리

이 디렉토리에는 Faked Door 프로젝트의 상세 문서들이 포함되어 있습니다.

## 문서 목록

### [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
프로젝트의 전체 구현 내역을 정리한 문서입니다.
- 구현 단계별 상세 내역
- 생성된 파일 목록
- 사용된 라이브러리
- 보안 고려사항

### [ARCHITECTURE.md](./ARCHITECTURE.md)
프로젝트의 아키텍처와 시스템 설계를 설명하는 문서입니다.
- 시스템 개요
- 기술 스택
- 데이터 흐름
- 데이터베이스 스키마
- 보안 아키텍처
- 성능 최적화

### [API_REFERENCE.md](./API_REFERENCE.md)
모든 API 엔드포인트의 상세 레퍼런스입니다.
- Public API
- Admin API
- Webhook API
- 에러 응답 형식
- 예제 코드

## 루트 문서

프로젝트 루트에도 다음 문서들이 있습니다:

- [README.md](../README.md): 프로젝트 개요 및 빠른 시작 가이드
- [SETUP_GUIDE.md](../SETUP_GUIDE.md): 상세한 설정 가이드
- [PREPARATION_CHECKLIST.md](../PREPARATION_CHECKLIST.md): 준비 체크리스트
- [WEBHOOK_SETUP.md](../WEBHOOK_SETUP.md): Clerk 웹훅 설정 가이드

## 문서 업데이트

프로젝트가 업데이트될 때마다 관련 문서도 함께 업데이트해야 합니다.

### 문서 업데이트 체크리스트

- [ ] 새로운 기능 추가 시 IMPLEMENTATION_SUMMARY.md 업데이트
- [ ] 아키텍처 변경 시 ARCHITECTURE.md 업데이트
- [ ] API 변경 시 API_REFERENCE.md 업데이트
- [ ] 설정 방법 변경 시 SETUP_GUIDE.md 업데이트

## 문서 작성 가이드

### 마크다운 스타일
- 제목은 `#`, `##`, `###` 순서로 사용
- 코드 블록은 언어 태그 포함
- 링크는 상대 경로 사용

### 다이어그램
- ASCII 아트 또는 Mermaid 다이어그램 사용
- 복잡한 다이어그램은 이미지로 대체 가능

### 예제 코드
- 실제 작동하는 코드 예제 제공
- 필요한 import 문 포함
- 주석으로 설명 추가

