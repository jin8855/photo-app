# SHOOTING_GUIDE_FULL_SPEC.md

## 🎯 목적
촬영 가이드를 상황 + 대상 + 태그 기반 구조로 정의하고,
기본 팁 / 상세 팁 / 촬영 설정값(화이트밸런스 등)을 포함한 전체 구조를 Codex가 일관되게 구현할 수 있도록 한다.

---

# 1. 전체 구조
상황 + 대상 + 태그 → 촬영 팁 세트 생성

---

# 2. 입력 구조
type ShootingContext = {
  situation: 'indoor' | 'outdoor' | 'travel' | 'home'
  subject: 'person' | 'food' | 'landscape' | 'product' | 'pet'
  tags: string[]
}

---

# 3. 카테고리 정의

## 상황
indoor / outdoor / travel / home

## 대상
person / food / landscape / product / pet / object

## 태그

### 날씨
rain / snow / cloudy / sunny

### 빛
backlight / sunset / night / natural_light / indoor_light

### 장소
cafe / concert / beach / street / mountain

### 디테일
flower / car / dessert / drink

---

# 4. 촬영 팁 구조
type ShootingTip = {
  tipTitle: string
  tipShort: string

  tipDetail: string
  tipWhy: string
  tipWhen: string
  tipExample: string

  approxWhiteBalance?: string
  approxAperture?: string
  approxShutterSpeed?: string
  approxISO?: string
  approxExposureComp?: string
  focusHint?: string
  lensHint?: string
  phoneCameraHint?: string
}

---

# 5. 노출 규칙

## 기본 화면
- tipTitle
- tipShort

## 자세히/툴팁
- tipDetail
- tipWhy
- tipWhen
- tipExample
- 촬영 설정값

---

# 6. 설정값 규칙

- 고정값 ❌
- 범위형 ⭕

예:
화이트밸런스: 5000K~6500K
조리개: f/1.8~2.8
셔터속도: 1/125 이상
ISO: 100~400

---

# 7. 매핑 구조
type ShootingTipMapping = {
  situation?: string
  subject?: string
  tags?: string[]
  tips: ShootingTip[]
}

---

# 8. 매칭 로직
1순위: 상황+대상+태그
2순위: 상황+대상
3순위: 대상
4순위: 기본 팁

---

# 9. 출력
핵심 1개 + 보조 2~4개

---

# 10. 핵심 원칙
- 기본은 짧게
- 자세히는 확장
- 사진과 문구 분리 유지
- 선택 시 즉시 반영
