# STEP 1 - PROJECT RULES

## 목적
프로젝트 구조 안정화 및 확장성 확보

---

## 핵심 구조

Tone = 이미지 전체 느낌  
Style = 표현 방식  
Theme = 감정/문장  

Frame / Date / Grain = Tone 내부 포함

---

## 레이어 규칙

features = UI  
domains = 로직  
content = 데이터  

UI는 판단하지 않는다  
Domain은 조합만 한다  
Content는 데이터만 가진다

---

## 금지

- UI에 로직 작성 ❌
- content 직접 사용 ❌
- tone/style/theme 혼합 ❌

---

## 목표

확장 시 기존 코드 수정 없이 추가만 가능해야 한다
