# Sentential 구현 계획

## 1단계: 프로젝트 구조 및 Docker Compose 설정

### 디렉토리 구조

```
sentential/
├── docker-compose.yml
├── frontend/          # Next.js
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/           # FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
└── db/
    └── init.sql       # pgvector 확장 + 테이블 생성
```

### docker-compose.yml 구성

| 서비스 | 이미지 | 포트 |
|--------|--------|------|
| `db` | pgvector/pgvector:pg16 | 5432 |
| `backend` | python:3.12 (빌드) | 8000 |
| `frontend` | node:20 (빌드) | 3000 |

- `db` → backend가 depends_on
- `backend` → frontend가 depends_on
- 볼륨: `pgdata`로 DB 데이터 영속화

---

## 2단계: 데이터베이스 (PostgreSQL + pgvector)

### init.sql

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE sentences (
    id         BIGSERIAL PRIMARY KEY,
    content    TEXT NOT NULL,
    embedding  vector(1024),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON sentences USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

- 임베딩 차원: 1024 (Voyage AI `voyage-4` 기본값)
- 코사인 유사도 기반 인덱스

---

## 3단계: 백엔드 (FastAPI)

### 의존성

- `fastapi`, `uvicorn`
- `asyncpg`, `sqlalchemy[asyncio]`
- `pgvector` (SQLAlchemy 통합)
- `voyageai` (임베딩 생성)
- `pydantic`

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/sentences` | 문장 추가 (임베딩 생성 후 저장) |
| GET | `/api/sentences/search?q=` | 시맨틱 검색 (유사도 순 정렬) |
| PUT | `/api/sentences/{id}` | 문장 수정 (임베딩 재생성) |
| DELETE | `/api/sentences/{id}` | 문장 삭제 |

### 핵심 로직

1. **임베딩 생성**: Voyage AI API (`voyage-4`)로 문장 → 1024차원 벡터 변환
2. **시맨틱 검색**: 검색어를 임베딩한 뒤, `<=>` (코사인 거리) 연산자로 유사 문장 조회
3. **환경변수**: `VOYAGE_API_KEY`, `DATABASE_URL`을 `.env`에서 관리

### 디렉토리

```
backend/app/
├── main.py          # FastAPI 앱, CORS 설정
├── config.py        # 환경변수 로딩
├── database.py      # DB 연결 (async SQLAlchemy)
├── models.py        # SQLAlchemy 모델
├── schemas.py       # Pydantic 스키마
├── routes/
│   └── sentences.py # CRUD + 검색 라우터
└── services/
    └── embedding.py # Voyage AI 임베딩 호출
```

---

## 4단계: 프론트엔드 (Next.js)

### 페이지 구성

단일 페이지 (`/`) — 구글 검색 스타일

### UI 흐름

```
[검색창 (화면 중앙)]
     │
     ├─ 텍스트 입력 → Enter ──→ 시맨틱 검색 실행 → 결과 목록 표시
     │
     └─ 텍스트 입력 → 저장 버튼 ──→ 새 문장으로 저장
```

### 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `SearchBar` | 검색/입력창. Enter로 검색, 별도 버튼으로 저장 |
| `SentenceList` | 검색 결과 목록 |
| `SentenceCard` | 개별 문장 카드. 수정/삭제 기능 포함 |

### 디자인 가이드

- **메인 컬러**: 검은색 (`#000`) 배경, 흰색 텍스트
- **검색창**: 화면 정중앙, 큰 사이즈, 흰색 테두리
- **결과 표시**: 검색 시 검색창이 상단으로 이동, 아래에 결과 나열
- **반응형**: 모바일 우선, 패딩과 폰트 크기 조정
- **폰트**: 시스템 폰트 스택 (빠른 로딩)

### 기술 세부

- App Router 사용
- `fetch`로 백엔드 API 호출 (클라이언트 컴포넌트)
- 환경변수: `NEXT_PUBLIC_API_URL`로 백엔드 주소 지정

---

## 5단계: 통합 및 테스트

1. `docker compose up --build`로 전체 서비스 기동
2. 문장 추가 → 검색 → 수정 → 삭제 시나리오 수동 테스트
3. 모바일 뷰포트에서 UI 확인

---

## 6단계: 배포 (Cloudflare)

1. 서버에서 Docker Compose 실행
2. Cloudflare DNS에 도메인 A 레코드 연결
3. Cloudflare Proxy를 통한 HTTPS 자동 적용
4. (선택) Cloudflare Tunnel로 서버 직접 노출 없이 연결

---

## 구현 순서 요약

| 순서 | 작업 | 산출물 |
|------|------|--------|
| 1 | 프로젝트 구조 + Docker Compose | `docker-compose.yml`, Dockerfiles |
| 2 | DB 초기화 스크립트 | `db/init.sql` |
| 3 | 백엔드 API 구현 | FastAPI 앱 전체 |
| 4 | 프론트엔드 구현 | Next.js 앱 전체 |
| 5 | 통합 테스트 | 동작 검증 |
| 6 | 배포 | Cloudflare 연동 |
