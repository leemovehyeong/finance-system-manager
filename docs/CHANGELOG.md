# 변경 이력

---

## 2026-03-23 — Phase 5 완료

### 추가

**용지 재고 관리**
- `/admin/paper` — 재고 현황 (박스/낱개 표시, 프로그레스 바, 최근 이력)
- `/admin/paper/deliver` — 용지 지급 (재고 차감 + 부족 알림 자동)
- `/admin/paper/stock-in` — 용지 입고 (박스+낱개 입력, 미리보기)

**자동 차감**
- `/api/paper-deduct` — 용지 티켓 완료 시 자동 차감 API
- `TicketDetailView` — 용지 티켓(type=paper) 완료 시 /api/paper-deduct 호출

**부족 알림**
- 지급/자동차감 후 재고가 low_threshold 이하면 전체 알림 생성

### 변경
- `lib/constants.ts` — PAPER_TYPES 실제 값 반영 (포스 25봉/박스, 천용지 25봉/박스, 휴대용 5봉/박스)
- DB paper_stock 초기값 업데이트 (329/244/39)

---

## 2026-03-23 — Phase 4 완료

### 추가

**외부 접수 (로그인 불필요)**
- `/request` — 공개 접수 페이지 (범용 QR, 명함/스티커용)
- `/request?store=uuid` — 거래처 전용 접수 (거래처 정보 자동 채움)
- `/request/complete` — 접수 완료 안내 페이지
- `/request/layout.tsx` — 외부접수 레이아웃 (BottomNav 없음)
- 스팸 방지: 같은 전화번호 10분 내 중복 접수 차단
- 접수 시 전체 알림 자동 생성 (🌐 외부접수 뱃지)

**QR 생성**
- `components/common/QRGenerator.tsx` — QR 생성 + 다운로드 (qrcode 패키지)
- `/admin/stores/[id]` — 거래처 상세에 전용 QR 코드 섹션 추가

### 설정
- qrcode, @types/qrcode 패키지 설치

---

## 2026-03-23 — Phase 3 완료

### 추가

**공유 컴포넌트**
- `components/common/ChecklistView.tsx` — 체크리스트 (진행률 바 + 아이템, 영업/설치 재사용)
- `components/common/DocumentUpload.tsx` — 서류 업로드/목록/삭제

**관리자 영업/설치 관리**
- `/admin/sales` — 영업 프로젝트 목록 (상태 필터)
- `/admin/sales/new` — 새 영업 프로젝트 생성 (거래처 검색 연동)
- `/admin/sales/[id]` — 프로젝트 상세 (4탭: 정보/영업체크리스트/설치체크리스트/서류)
  - 상태 변경, 설치 담당자 배정, 일정 설정
  - 영업 체크리스트 (SALES_CHECKLIST_TEMPLATE)
  - 설치 체크리스트 (INSTALL_CHECKLIST_TEMPLATE)
  - 서류 업로드 (sales-documents 버킷)
  - 사진 업로드 (install-photos 버킷)

**현장직 설치 화면**
- `/field/sales/[id]` — 설치 체크리스트 진행 + 사진 업로드 + 완료 처리

**D-1 리마인더**
- `/api/reminders` — 설치 D-1 리마인더 API (Vercel Cron 연동 가능)

---

## 2026-03-23 — Phase 2 완료

### 추가

**카카오맵 연동**
- `types/kakao.d.ts` — 카카오맵 SDK 타입 선언
- `lib/kakao-map.ts` — SDK 로드, 주소→좌표 변환, 카카오내비 URL, 마커 색상
- `components/map/KakaoMap.tsx` — 카카오맵 컴포넌트 (마커, 팝업, 상태별 색상)
- `components/map/RouteOptimizer.tsx` — 동선 최적화 (nearest-neighbor, Haversine 거리)

**지도 페이지**
- `/field/map` — 현장직 실시간 A/S 지도 + 동선 최적화
- `/admin/map` — 관리자 전체 A/S 지도
- 현장직 하단 네비에 지도 탭 추가

**거래처 관리**
- `/admin/stores` — 거래처 목록 (검색 + 지역 필터)
- `/admin/stores/new` — 거래처 등록 (주소→좌표 자동변환)
- `/admin/stores/[id]` — 거래처 상세 + 수정 + 방문이력 (TicketCard 재사용)
- `components/store/StoreSearch.tsx` — 거래처 검색/자동완성 (디바운스 200ms)

**기존 페이지 개선**
- `/office/tickets/new` — 거래처 검색/자동완성 연동, store_id 연결

---

## 2026-03-23 — Phase 1 완료

### 추가

**페이지 (21개)**
- `/login` — 이메일/비밀번호 로그인
- `/office/dashboard` — 사무직 대시보드 (상태별 카운트, 최근 티켓)
- `/office/tickets` — 티켓 목록 (상태 필터)
- `/office/tickets/new` — 새 티켓 접수 폼
- `/office/tickets/[id]` — 티켓 상세 (댓글, 이미지)
- `/office/stores` — 거래처 목록/검색
- `/office/notifications` — 사무직 알림
- `/field/dashboard` — 현장직 대시보드 (대기/진행/완료 요약)
- `/field/tickets` — 업무 피드 (수락 버튼, Realtime 구독)
- `/field/tickets/[id]` — 티켓 상세
- `/field/my-tasks` — 내 업무 (진행중/완료 탭)
- `/field/notifications` — 현장직 알림
- `/admin/dashboard` — 관리자 대시보드 (통계, 직원 현황, 용지 재고)
- `/admin/tickets` — 전체 티켓 관리
- `/admin/tickets/[id]` — 티켓 상세 (배정/취소)
- `/admin/employees` — 직원 관리 (역할 뱃지, 전화 링크)
- `/admin/stats` — 통계 (상태별 프로그레스 바, 유형별 카운트)
- `/admin/notifications` — 관리자 알림

**공유 컴포넌트 (18개)**
- `components/ui/` — Button, Card, Badge, Input, Select, Textarea, Skeleton, EmptyState
- `components/ticket/` — TicketCard, TicketDetailView, TicketStatusBadge, TicketTypeBadge, PriorityIndicator
- `components/common/` — PhoneLink, ImageUpload, NotificationsList, ServiceWorkerRegistration
- `components/layout/` — BottomNav (+ 8개 아이콘), TopBar

**코어 라이브러리**
- `lib/constants.ts` — 단일 진실 공급원 (티켓유형, 상태, 우선순위, 영업상태, 용지, 역할, 장비, 체크리스트 등)
- `lib/supabase.ts` — 브라우저 클라이언트
- `lib/supabase-server.ts` — 서버 클라이언트
- `lib/auth-context.tsx` — 인증 상태 Context
- `lib/utils.ts` — timeAgo, formatPhone, formatDate, cn
- `types/index.ts` — 전체 타입 정의 (constants 키 파생)
- `middleware.ts` — 인증 미들웨어 (미인증 → /login 리다이렉트)

**DB 스키마 (sql/schema.sql)**
- employees, stores, tickets, ticket_comments, sales_projects, notifications, paper_stock, paper_transactions
- RLS 정책 (인증 사용자 전체 허용 + 외부접수 INSERT)
- Realtime 활성화 (tickets, ticket_comments, notifications, paper_stock, sales_projects)
- updated_at 자동 갱신 트리거

**PWA**
- `public/manifest.json`
- `public/sw.js` (Network-first 전략)

**디자인**
- Apple HIG 감성 UI 전체 적용
- Tailwind 커스텀 테마 (tailwind.config.ts)
- 전역 CSS (skeleton 애니메이션, press-effect, safe-area)

### 설정
- Supabase 프로젝트 생성 (finance-system-manager, Northeast Asia Seoul)
- 환경변수 연결 (.env.local)
- DB 스키마 실행 (8개 테이블, 인덱스, RLS, Realtime, 트리거)
- Storage 버킷 4개 생성 (ticket-images, sales-documents, install-photos, profile-images)
- Storage 정책 설정 (Public read, Authenticated upload/update/delete)
- 관리자 계정 생성 (이동형, admin)
