# 아키텍처 문서

> 최종 업데이트: 2026-03-23 (Phase 1 완료)

---

## 1. 폴더 구조

```
finance-system-manager/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (AuthProvider, PWA, 메타)
│   ├── page.tsx                      # / → /login 리다이렉트
│   ├── globals.css                   # 전역 스타일 (skeleton, press-effect, safe-area)
│   ├── login/
│   │   └── page.tsx                  # 로그인 (이메일/비밀번호)
│   ├── office/                       # 사무직 영역
│   │   ├── layout.tsx                # 사무직 하단 네비 (홈/티켓/거래처/알림)
│   │   ├── dashboard/page.tsx        # 사무직 대시보드
│   │   ├── tickets/
│   │   │   ├── page.tsx              # 티켓 목록 (필터)
│   │   │   ├── new/page.tsx          # 새 티켓 접수 폼
│   │   │   └── [id]/page.tsx         # 티켓 상세
│   │   ├── stores/page.tsx           # 거래처 목록/검색
│   │   └── notifications/page.tsx    # 알림
│   ├── field/                        # 현장직 영역
│   │   ├── layout.tsx                # 현장직 하단 네비 (홈/피드/내업무/알림)
│   │   ├── dashboard/page.tsx        # 현장직 대시보드
│   │   ├── tickets/
│   │   │   ├── page.tsx              # 업무 피드 (수락 버튼)
│   │   │   └── [id]/page.tsx         # 티켓 상세
│   │   ├── my-tasks/page.tsx         # 내 업무 (진행중/완료 탭)
│   │   └── notifications/page.tsx    # 알림
│   └── admin/                        # 관리자 영역
│       ├── layout.tsx                # 관리자 하단 네비 (홈/티켓/통계/직원/알림)
│       ├── dashboard/page.tsx        # 관리자 대시보드 (통계/직원현황/재고)
│       ├── tickets/
│       │   ├── page.tsx              # 전체 티켓 관리
│       │   └── [id]/page.tsx         # 티켓 상세 (배정/취소)
│       ├── employees/page.tsx        # 직원 관리
│       ├── stats/page.tsx            # 통계 (상태별/유형별)
│       └── notifications/page.tsx    # 알림
├── components/
│   ├── ui/                           # 범용 UI 컴포넌트
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Skeleton.tsx
│   │   └── Textarea.tsx
│   ├── ticket/                       # 티켓 관련 컴포넌트
│   │   ├── PriorityIndicator.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketDetailView.tsx
│   │   ├── TicketStatusBadge.tsx
│   │   └── TicketTypeBadge.tsx
│   ├── common/                       # 공통 기능 컴포넌트
│   │   ├── ImageUpload.tsx
│   │   ├── NotificationsList.tsx
│   │   ├── PhoneLink.tsx
│   │   └── ServiceWorkerRegistration.tsx
│   └── layout/                       # 레이아웃 컴포넌트
│       ├── BottomNav.tsx
│       └── TopBar.tsx
├── lib/
│   ├── constants.ts                  # 단일 진실 공급원 (모든 상수)
│   ├── supabase.ts                   # 브라우저 Supabase 클라이언트
│   ├── supabase-server.ts            # 서버 Supabase 클라이언트
│   ├── auth-context.tsx              # 인증 상태 Context (user, employee)
│   └── utils.ts                      # 유틸리티 (timeAgo, formatPhone, formatDate, cn)
├── types/
│   └── index.ts                      # 전체 타입 정의 (constants 키에서 파생)
├── sql/
│   └── schema.sql                    # DB 스키마 전체 (Supabase SQL Editor용)
├── public/
│   ├── manifest.json                 # PWA 매니페스트
│   ├── sw.js                         # 서비스워커
│   └── icons/                        # PWA 아이콘 (아직 미추가)
├── middleware.ts                      # 인증 미들웨어
├── tailwind.config.ts                # Tailwind 커스텀 테마 (Apple HIG)
├── .env.local                        # 환경변수 (git 제외)
└── package.json
```

---

## 2. 라우트 맵

| URL | 파일 경로 | 접근 역할 | 설명 |
|-----|----------|----------|------|
| `/` | `app/page.tsx` | 전체 | → `/login` 리다이렉트 |
| `/login` | `app/login/page.tsx` | 미인증 | 이메일/비밀번호 로그인 |
| `/office/dashboard` | `app/office/dashboard/page.tsx` | office | 사무직 대시보드 |
| `/office/tickets` | `app/office/tickets/page.tsx` | office | 티켓 목록 (상태 필터) |
| `/office/tickets/new` | `app/office/tickets/new/page.tsx` | office | 새 티켓 접수 |
| `/office/tickets/[id]` | `app/office/tickets/[id]/page.tsx` | office | 티켓 상세 |
| `/office/stores` | `app/office/stores/page.tsx` | office | 거래처 목록/검색 |
| `/office/notifications` | `app/office/notifications/page.tsx` | office | 알림 |
| `/field/dashboard` | `app/field/dashboard/page.tsx` | field | 현장직 대시보드 |
| `/field/tickets` | `app/field/tickets/page.tsx` | field | 업무 피드 (수락) |
| `/field/tickets/[id]` | `app/field/tickets/[id]/page.tsx` | field | 티켓 상세 |
| `/field/my-tasks` | `app/field/my-tasks/page.tsx` | field | 내 업무 |
| `/field/notifications` | `app/field/notifications/page.tsx` | field | 알림 |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | admin | 관리자 대시보드 |
| `/admin/tickets` | `app/admin/tickets/page.tsx` | admin | 전체 티켓 관리 |
| `/admin/tickets/[id]` | `app/admin/tickets/[id]/page.tsx` | admin | 티켓 상세 (배정/취소) |
| `/admin/employees` | `app/admin/employees/page.tsx` | admin | 직원 관리 |
| `/admin/stats` | `app/admin/stats/page.tsx` | admin | 통계 |
| `/admin/notifications` | `app/admin/notifications/page.tsx` | admin | 알림 |

---

## 3. Supabase 테이블 관계도

```
auth.users (Supabase Auth)
  └─ employees.auth_id → auth.users.id

employees
  ├─ tickets.created_by → employees.id
  ├─ tickets.assigned_to → employees.id
  ├─ ticket_comments.employee_id → employees.id
  ├─ sales_projects.sales_person → employees.id
  ├─ sales_projects.installer → employees.id
  └─ paper_transactions.employee_id → employees.id

stores
  ├─ tickets.store_id → stores.id
  └─ sales_projects.store_id → stores.id

tickets
  ├─ ticket_comments.ticket_id → tickets.id (CASCADE)
  ├─ notifications.related_ticket_id → tickets.id
  └─ paper_transactions.ticket_id → tickets.id

sales_projects
  └─ notifications.related_sales_id → sales_projects.id

paper_stock (독립 — 용지 재고 3행)

paper_transactions (용지 입출고 이력)
```

---

## 4. 공유 컴포넌트 사용처

| 컴포넌트 | 사용처 |
|----------|--------|
| `TicketCard.tsx` | `/office/dashboard`, `/office/tickets`, `/field/dashboard`, `/field/tickets`, `/field/my-tasks`, `/admin/dashboard`, `/admin/tickets` |
| `TicketDetailView.tsx` | `/office/tickets/[id]`, `/field/tickets/[id]`, `/admin/tickets/[id]` |
| `TicketStatusBadge.tsx` | `TicketCard`, `TicketDetailView` |
| `TicketTypeBadge.tsx` | `TicketCard`, `TicketDetailView` |
| `PriorityIndicator.tsx` | `TicketCard`, `TicketDetailView` |
| `NotificationsList.tsx` | `/office/notifications`, `/field/notifications`, `/admin/notifications` |
| `PhoneLink.tsx` | `TicketDetailView`, `/office/stores`, `/admin/employees` |
| `ImageUpload.tsx` | `/office/tickets/new`, `TicketDetailView` (댓글) |
| `BottomNav.tsx` | `office/layout`, `field/layout`, `admin/layout` |
| `TopBar.tsx` | 대부분의 서브 페이지 |
| `Card.tsx` | 거의 모든 페이지 |
| `Button.tsx` | 로그인, 티켓 접수, 대시보드, 상세 |
| `Badge.tsx` | `TicketStatusBadge`, `TicketTypeBadge`, `/admin/employees` |
| `Skeleton.tsx` | 모든 목록/대시보드 페이지의 로딩 상태 |
| `EmptyState.tsx` | 데이터 없을 때 표시 (대시보드, 목록 등) |
| `Input.tsx` | 로그인, 티켓 접수, 거래처 검색 |
| `Select.tsx` | 티켓 접수 (유형/우선순위/장비) |
| `Textarea.tsx` | 티켓 접수 (상세 내용) |

---

## 5. 환경변수

| 변수 | 용도 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public 키 | 필수 |
| `NEXT_PUBLIC_APP_NAME` | 앱 이름 (UI 표시, 기본값: 금융시스템매니저) | 선택 |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오맵 JS API 키 (Phase 2) | Phase 2 |

---

## 6. 인증 흐름

```
1. 사용자 → /login 접속
2. 이메일/비밀번호 입력 → Supabase Auth signInWithPassword()
3. 성공 → employees 테이블에서 auth_id로 조회 → role 확인
4. role에 따라 리다이렉트:
   - admin → /admin/dashboard
   - office → /office/dashboard
   - field  → /field/dashboard
5. middleware.ts: 미인증 사용자 → /login, 인증 사용자가 /login → 역할별 대시보드
6. AuthProvider (lib/auth-context.tsx): 전역 user/employee 상태, onAuthStateChange 구독
```

---

## 7. Supabase Storage 버킷

| 버킷 | 용도 | 접근 |
|------|------|------|
| `ticket-images` | 티켓 현장 사진, 댓글 이미지 | Public |
| `sales-documents` | 영업 서류 (사업자등록증, 계약서) — Phase 3 | Public |
| `install-photos` | 설치 완료 사진 — Phase 3 | Public |
| `profile-images` | 직원 프로필 사진 | Public |
