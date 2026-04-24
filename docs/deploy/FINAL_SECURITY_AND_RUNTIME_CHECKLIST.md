# FINAL_SECURITY_AND_RUNTIME_CHECKLIST.md

## 목적
photos, analyses 테이블에 RLS를 적용하고 공개 정책을 제거한 뒤,
현재 서버 API 경유 구조가 실제 운영 앱 플로우를 깨지 않는지 최종 점검한다.

이번 문서는 보안 + 동작 최종 체크리스트다.
Codex는 이 문서를 기준으로
- 현재 구조 유지 여부
- 공개 접근 차단 상태
- 실제 기능 플로우 정상 여부
를 점검한다.

---

# 1. 현재 목표 상태

아래가 최종 목표다.

- photos: RLS ON
- analyses: RLS ON
- photos/analyses 공개 policy 없음
- 브라우저에서 DB 직접 접근 없음
- 모든 DB 작업은 서버 API 경유
- SUPABASE_SERVICE_ROLE_KEY는 서버 환경변수에서만 사용
- 업로드 / 분석 / 완성 이미지 생성 / 히스토리 조회 정상

---

# 2. 구조 확인

## 2-1. 브라우저 직접 접근 금지
브라우저 코드에서 아래가 없어야 한다.
- `createClient(...).from('photos')`
- `createClient(...).from('analyses')`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## 2-2. 서버 API 경유 구조
아래 흐름이 유지되어야 한다.

- 업로드:
  - browser -> `/api/photos/upload` -> service -> repository -> DB
- 분석:
  - browser -> `/api/photos/[photoId]/analyze` -> service -> repository -> DB
- 완성 이미지:
  - browser -> `/api/content-set` -> service -> repository -> DB
- 히스토리:
  - server component / server service -> repository -> DB

## 2-3. Storage
- Supabase Storage 접근은 서버 adapter에서만
- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용

---

# 3. Supabase 보안 확인

## 3-1. photos 테이블
확인할 것:
- RLS 활성화
- 정책 없음
- 공개 read/insert policy 없음
- API disabled 또는 공개 접근 차단 상태

## 3-2. analyses 테이블
확인할 것:
- RLS 활성화
- 정책 없음
- 공개 read/insert policy 없음
- API disabled 또는 공개 접근 차단 상태

## 3-3. revoke 확인
가능하면 아래도 확인:
- anon, authenticated role에 대한 테이블 직접 권한 revoke 유지
- sequence 직접 권한 revoke 유지

---

# 4. 환경변수 확인

## 서버 전용
필수:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 브라우저
허용 가능:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 금지
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

---

# 5. 실제 동작 최종 점검

## 5-1. 업로드
확인:
- 사진 업로드 성공
- `/api/photos/upload` 정상 응답
- DB에 photos row 생성
- storage path 정상 기록

## 5-2. 분석
확인:
- 분석 실행 성공
- `/api/photos/[photoId]/analyze` 정상 응답
- analyses row 생성
- 결과 화면 이동 정상

## 5-3. 완성 이미지 생성
확인:
- `/api/content-set` 정상 응답
- 결과 이미지 만들기 성공
- 저장/복사 흐름 정상

## 5-4. 히스토리
확인:
- 기존 결과 조회 가능
- 서버 렌더링 경유로 정상 표시
- 브라우저 직접 DB 호출 없음

---

# 6. 콘솔 / 로그 확인

## 브라우저 콘솔
확인:
- photos, analyses 직접 접근 에러 없음
- service role 노출 흔적 없음
- 저장/복사/UI 동작 오류 없음

## 서버 로그
확인:
- upload route 정상
- analyze route 정상
- content-set route 정상
- permission denied 에러 없음

---

# 7. PASS 기준

아래를 모두 만족하면 PASS다.

1. photos, analyses 모두 RLS ON
2. photos, analyses에 공개 정책 없음
3. 브라우저에서 DB 직접 접근 없음
4. service role key가 서버에서만 사용됨
5. 업로드 정상
6. 분석 정상
7. 완성 이미지 생성 정상
8. 히스토리 조회 정상
9. typecheck 통과
10. build 통과

---

# 8. HOLD 기준

아래 중 하나라도 있으면 HOLD다.

- 공개 정책이 남아 있음
- 브라우저에서 photos/analyses 직접 접근 흔적 있음
- service role key 노출 가능성 있음
- 업로드 / 분석 / 히스토리 중 하나라도 실패
- permission denied 또는 RLS 관련 런타임 에러 발생

---

# 9. Codex 실행 프롬프트

현재 상태:
- photos, analyses 모두 RLS 적용 완료
- 공개 정책 없음
- 브라우저 직접 DB 접근 없이 서버 API 경유 구조 유지
- Storage는 서버에서만 service role key 사용

이번 작업:
- 첨부된 최종 보안/동작 체크리스트 기준으로 현재 구조를 점검해
- 공개 정책을 만들지 말고, 지금 구조가 실제 앱 플로우를 깨지 않는지 최종 확인해

점검 항목:
1. `/api/photos/upload`
2. `/api/photos/[photoId]/analyze`
3. `/api/content-set`
4. 히스토리 조회
5. 브라우저 직접 접근 여부
6. service role key 노출 여부

중요:
- photos, analyses에 public policy 만들지 말 것
- RLS 유지
- API / repository / storage 구조 유지
- 브라우저 코드에 service role key 절대 금지

결과:
1. 최종 점검 결과
2. PASS / HOLD
3. 다음 단계 1개
