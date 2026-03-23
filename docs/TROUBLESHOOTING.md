# 트러블슈팅

---

## 알려진 이슈
(없음)

## 해결된 이슈

### Phase 1 빌드 시 ESLint 에러
- `TICKET_TYPES` 미사용 import → 제거
- `Badge` 미사용 import → 제거
- `employee` 미사용 변수 → 제거
- 모두 해결 완료. 빌드 정상 통과.

## 개발 환경 참고

| 항목 | 버전/정보 |
|------|----------|
| Node.js | v24.13.1 |
| npm | 11.8.0 |
| Next.js | 14 (App Router) |
| Tailwind CSS | 3.x |
| @supabase/supabase-js | 최신 |
| @supabase/ssr | 최신 |
| OS | macOS Darwin 24.6.0 |
| 패키지 매니저 | npm |
| 배포 | Vercel (예정) |
| DB | Supabase Pro — Northeast Asia (Seoul) |
