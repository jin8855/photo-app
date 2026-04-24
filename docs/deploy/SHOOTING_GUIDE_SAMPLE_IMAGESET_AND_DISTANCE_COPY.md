# SHOOTING_GUIDE_SAMPLE_IMAGESET_AND_DISTANCE_COPY.md

## 목적
촬영 가이드의 이해도를 높이기 위해
- 거리(접사 / 중간 / 원경) 축을 추가하고
- 예시 이미지 1~2장을 함께 보여주며
- 거리별 추천 문구 방향까지 연결한다.

이번 문서는 Codex가 바로 반영할 수 있는
**샘플 이미지 세트 정의 + 거리별 추천 문구 연결 정의서**다.

---

# 1. 최종 구조

촬영 가이드는 아래 구조를 사용한다.

```ts
type ShootingGuideContext = {
  situation: string
  subject: string
  distance: 'close_up' | 'medium' | 'wide'
}
```

즉:

- 상황 = 촬영 환경/조건
- 대상 = 무엇을 찍는지
- 거리 = 얼마나 가깝게 찍는지

---

# 2. 거리(distance) 정의

## close_up
### 사용자 노출명
- 접사

### 의미
- 피사체를 가까이 담는 사진
- 디테일, 질감, 표정, 작은 포인트 강조

### 주로 맞는 대상
- 꽃
- 음식
- 디저트
- 음료
- 제품
- 반려동물 얼굴
- 인물 얼굴 클로즈업

---

## medium
### 사용자 노출명
- 중간

### 의미
- 피사체와 배경의 균형이 있는 사진
- 정보와 분위기를 함께 담기 좋음

### 주로 맞는 대상
- 인물 반신
- 제품 + 주변 배치
- 음식 + 테이블 분위기
- 자동차 3/4 구도
- 꽃 + 줄기/배경 일부

---

## wide
### 사용자 노출명
- 원경

### 의미
- 배경, 공간감, 구도, 하늘/수평선/전체 장면 강조

### 주로 맞는 대상
- 풍경
- 바다
- 산
- 거리
- 공연장 전체 분위기
- 자동차 + 주변 공간
- 인물 + 배경

---

# 3. 예시 이미지 세트 구조

```ts
type ShootingGuideExampleImage = {
  src: string
  label: string
  alt: string
}

type ShootingGuideTip = {
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

  exampleImages?: ShootingGuideExampleImage[]
  recommendedCopyDirection?: string[]
}
```

---

# 4. 예시 이미지 세트 파일 규칙

## 폴더 구조 예시
```text
public/
  samples/
    shooting-guide/
      sunset-beach-wide-01.jpg
      sunset-beach-wide-02.jpg
      indoor-food-close-01.jpg
      indoor-food-close-02.jpg
      backlight-person-medium-01.jpg
      concert-person-medium-01.jpg
      rainy-street-wide-01.jpg
      flower-close-01.jpg
      car-outdoor-medium-01.jpg
      mountain-cloudy-wide-01.jpg
```

## 파일명 규칙
```text
{상황}-{대상}-{거리}-{번호}.jpg
```

예:
- sunset-beach-wide-01.jpg
- indoor-food-close-01.jpg
- backlight-person-medium-01.jpg

---

# 5. 샘플 이미지 세트 제안

아래는 바로 넣기 좋은 최소 샘플 세트다.

## A. 노을 + 바다 + 원경
### 파일
- sunset-beach-wide-01.jpg
- sunset-beach-wide-02.jpg

### 라벨
- 수평선 낮게 배치
- 하늘 강조 구도

### 보여주고 싶은 포인트
- 수평선 위치
- 하늘 비중
- 노을 색감

---

## B. 실내 + 음식 + 접사
### 파일
- indoor-food-close-01.jpg
- indoor-food-close-02.jpg

### 라벨
- 질감 강조 구도
- 옆빛 활용 예시

### 보여주고 싶은 포인트
- 가까이 담기
- 빛 방향
- 배경 단순화

---

## C. 역광 + 인물 + 중간
### 파일
- backlight-person-medium-01.jpg
- backlight-person-medium-02.jpg

### 라벨
- 얼굴 밝기 우선
- 배경빛 살린 인물

### 보여주고 싶은 포인트
- 얼굴 노출
- 배경광 활용
- 인물과 배경 균형

---

## D. 공연 + 인물 + 중간
### 파일
- concert-person-medium-01.jpg
- concert-person-medium-02.jpg

### 라벨
- 움직임 포착
- 조명 활용 인물샷

### 보여주고 싶은 포인트
- 셔터 속도
- 흔들림 방지
- 공연 조명 활용

---

## E. 비 + 거리 + 원경
### 파일
- rainy-street-wide-01.jpg
- rainy-street-wide-02.jpg

### 라벨
- 바닥 반사 활용
- 우산/거리 분위기

### 보여주고 싶은 포인트
- 반사광
- 분위기 연출
- 거리 전체 장면

---

## F. 맑음 + 꽃 + 접사
### 파일
- flower-close-01.jpg
- flower-close-02.jpg

### 라벨
- 꽃잎 디테일
- 배경 흐림 예시

### 보여주고 싶은 포인트
- 가까이 찍기
- 배경 정리
- 피사체 강조

---

## G. 실외 + 자동차 + 중간
### 파일
- car-outdoor-medium-01.jpg
- car-outdoor-medium-02.jpg

### 라벨
- 45도 각도 예시
- 차체 라인 강조

### 보여주고 싶은 포인트
- 대각선 구도
- 반사 관리
- 차체 라인

---

## H. 흐림 + 산 + 원경
### 파일
- mountain-cloudy-wide-01.jpg
- mountain-cloudy-wide-02.jpg

### 라벨
- 안개/층 강조
- 넓은 산세 구도

### 보여주고 싶은 포인트
- 깊이감
- 층 분리
- 흐린 날 색감

---

# 6. 거리별 추천 문구 방향

촬영 가이드는 단순 사진 팁에서 끝나지 않고,
거리 정보에 따라 추천 문구 방향까지 연결할 수 있다.

## 6-1. 접사(close_up)
### 문구 성격
- 디테일 강조
- 감각/질감 표현
- 가까운 감정
- 포인트 집중

### 문구 방향 예시
- 작지만 분명하게 남는 순간
- 가까이 볼수록 더 예쁜 장면
- 작은 결이 더 오래 남는다
- 가까이 담으니 마음도 선명하다

### 잘 맞는 대상
- 꽃
- 음식
- 제품
- 반려동물 얼굴
- 디테일 컷

---

## 6-2. 중간(medium)
### 문구 성격
- 분위기 + 대상 균형
- 관계성
- 장면 설명력
- 활용도 높은 보편 문구

### 문구 방향 예시
- 오늘의 분위기가 가장 잘 남는 거리
- 장면도 감정도 함께 담기는 순간
- 가까움과 여유가 같이 남는다
- 설명하지 않아도 분위기가 전해진다

### 잘 맞는 대상
- 인물
- 제품
- 음식 + 테이블
- 자동차
- 반신 인물샷

---

## 6-3. 원경(wide)
### 문구 성격
- 공간감
- 장면 전체 인상
- 여행/기억/풍경 감성
- 서정적 표현

### 문구 방향 예시
- 멀리서 봐야 더 잘 보이는 장면
- 공간 전체가 감정이 되는 순간
- 오늘의 공기가 함께 남는다
- 장면보다 오래 남는 분위기

### 잘 맞는 대상
- 바다
- 산
- 풍경
- 거리
- 공연장 전체
- 인물 + 배경

---

# 7. 상황 + 대상 + 거리 샘플 데이터

아래는 바로 넣기 좋은 샘플이다.

```json
[
  {
    "situation": "노을",
    "subject": "바다",
    "distance": "wide",
    "tips": [
      {
        "tipTitle": "수평선 위치 조정",
        "tipShort": "수평선을 아래쪽에 두고 하늘을 더 크게 담아보세요.",
        "tipDetail": "노을 사진은 하늘 색이 핵심이라 하늘 비중을 높이면 장면이 더 살아납니다.",
        "tipWhy": "노을 색감과 공간감이 함께 살아납니다.",
        "tipWhen": "바다, 호수, 넓은 하늘 풍경",
        "tipExample": "수평선을 화면 아래 1/3 부근에 두고 찍어보세요.",
        "approxWhiteBalance": "5000K~6500K",
        "approxAperture": "f/5.6~8",
        "approxShutterSpeed": "1/125 이상",
        "approxISO": "100~200",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/sunset-beach-wide-01.jpg",
            "label": "수평선 낮게 배치",
            "alt": "노을 바다 풍경 예시"
          },
          {
            "src": "/samples/shooting-guide/sunset-beach-wide-02.jpg",
            "label": "하늘 강조 구도",
            "alt": "하늘 비중을 높인 노을 바다 예시"
          }
        ],
        "recommendedCopyDirection": [
          "공간 전체가 감정이 되는 순간",
          "오늘의 공기가 함께 남는다",
          "멀리서 봐야 더 잘 보이는 장면"
        ]
      }
    ]
  },
  {
    "situation": "실내",
    "subject": "음식",
    "distance": "close_up",
    "tips": [
      {
        "tipTitle": "가까이 담아 질감 살리기",
        "tipShort": "음식의 질감이 보이도록 한 걸음 더 가까이 가보세요.",
        "tipDetail": "접사에서는 배경보다 음식 표면의 질감과 빛 방향이 더 중요합니다.",
        "tipWhy": "가까이 담을수록 먹음직스러운 포인트가 살아납니다.",
        "tipWhen": "디저트, 브런치, 따뜻한 음식",
        "tipExample": "포크 자국, 크림 결, 과일 단면 같은 디테일을 살려보세요.",
        "approxWhiteBalance": "3200K~4200K",
        "approxAperture": "f/1.8~2.8",
        "approxShutterSpeed": "1/60 이상",
        "approxISO": "100~400",
        "phoneCameraHint": "밝기를 살짝 낮추면 색이 더 진하게 보일 수 있습니다.",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/indoor-food-close-01.jpg",
            "label": "질감 강조 구도",
            "alt": "실내 음식 접사 예시"
          },
          {
            "src": "/samples/shooting-guide/indoor-food-close-02.jpg",
            "label": "옆빛 활용 예시",
            "alt": "옆에서 들어오는 빛을 활용한 음식 접사 예시"
          }
        ],
        "recommendedCopyDirection": [
          "작지만 분명하게 남는 순간",
          "가까이 볼수록 더 예쁜 장면",
          "작은 결이 더 오래 남는다"
        ]
      }
    ]
  },
  {
    "situation": "역광",
    "subject": "인물",
    "distance": "medium",
    "tips": [
      {
        "tipTitle": "얼굴 밝기 먼저 맞추기",
        "tipShort": "배경보다 얼굴 밝기를 먼저 맞춰보세요.",
        "tipDetail": "역광에서는 배경은 예쁘지만 인물이 어둡게 묻히기 쉽습니다.",
        "tipWhy": "인물이 살아야 사진의 전달력이 올라갑니다.",
        "tipWhen": "창가, 노을 인물, 실내 카페 인물",
        "tipExample": "얼굴을 터치한 뒤 밝기를 조금 올려 촬영해보세요.",
        "approxExposureComp": "+0.3~+1.0",
        "approxShutterSpeed": "1/125 이상",
        "focusHint": "눈이나 얼굴 중앙에 초점",
        "phoneCameraHint": "화면 길게 눌러 초점과 밝기를 함께 맞춰보세요.",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/backlight-person-medium-01.jpg",
            "label": "얼굴 밝기 우선",
            "alt": "역광 인물 중간 거리 예시"
          },
          {
            "src": "/samples/shooting-guide/backlight-person-medium-02.jpg",
            "label": "배경빛 살린 인물",
            "alt": "배경빛을 살린 역광 인물 예시"
          }
        ],
        "recommendedCopyDirection": [
          "장면도 감정도 함께 담기는 순간",
          "설명하지 않아도 분위기가 전해진다",
          "가까움과 여유가 같이 남는다"
        ]
      }
    ]
  },
  {
    "situation": "공연",
    "subject": "인물",
    "distance": "medium",
    "tips": [
      {
        "tipTitle": "움직임이 멈추는 순간 잡기",
        "tipShort": "움직임이 멈추는 박자에 맞춰 찍어보세요.",
        "tipDetail": "공연장은 흔들림과 조명 변화가 많아 타이밍이 특히 중요합니다.",
        "tipWhy": "같은 장면도 타이밍에 따라 훨씬 선명하게 남습니다.",
        "tipWhen": "무대, 라이브 공연, 팬캠 느낌 사진",
        "tipExample": "손동작이 멈추는 순간이나 표정이 또렷한 순간을 노려보세요.",
        "approxShutterSpeed": "1/250 이상",
        "approxISO": "800~1600",
        "focusHint": "얼굴이나 상체 중심",
        "phoneCameraHint": "연속 촬영 또는 짧은 간격으로 여러 장 찍어보세요.",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/concert-person-medium-01.jpg",
            "label": "움직임 포착",
            "alt": "공연장 인물 중간 거리 예시"
          },
          {
            "src": "/samples/shooting-guide/concert-person-medium-02.jpg",
            "label": "조명 활용 인물샷",
            "alt": "공연 조명을 활용한 인물 예시"
          }
        ],
        "recommendedCopyDirection": [
          "장면도 감정도 함께 담기는 순간",
          "설명하지 않아도 분위기가 전해진다",
          "오늘의 분위기가 가장 잘 남는 거리"
        ]
      }
    ]
  },
  {
    "situation": "비",
    "subject": "거리",
    "distance": "wide",
    "tips": [
      {
        "tipTitle": "바닥 반사 활용하기",
        "tipShort": "젖은 바닥에 비친 빛까지 함께 담아보세요.",
        "tipDetail": "비 오는 날은 바닥 반사와 공기감이 사진의 분위기를 크게 바꿉니다.",
        "tipWhy": "평범한 거리도 감성적인 장면으로 바뀝니다.",
        "tipWhen": "비 오는 저녁, 골목, 신호등 주변",
        "tipExample": "가로등이나 간판 빛이 비친 바닥이 보이게 구도 잡아보세요.",
        "approxISO": "200~800",
        "approxShutterSpeed": "1/60 이상",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/rainy-street-wide-01.jpg",
            "label": "바닥 반사 활용",
            "alt": "비 오는 거리 원경 예시"
          },
          {
            "src": "/samples/shooting-guide/rainy-street-wide-02.jpg",
            "label": "우산과 거리 분위기",
            "alt": "비 오는 거리와 우산 예시"
          }
        ],
        "recommendedCopyDirection": [
          "공간 전체가 감정이 되는 순간",
          "오늘의 공기가 함께 남는다",
          "장면보다 오래 남는 분위기"
        ]
      }
    ]
  },
  {
    "situation": "맑음",
    "subject": "꽃",
    "distance": "close_up",
    "tips": [
      {
        "tipTitle": "꽃을 더 크게 담기",
        "tipShort": "꽃잎 결이 보이도록 한 걸음 더 가까이 가보세요.",
        "tipDetail": "꽃은 멀리서보다 가까이서 찍을 때 색과 결이 훨씬 잘 보입니다.",
        "tipWhy": "포인트가 선명해지고 배경도 깔끔해집니다.",
        "tipWhen": "공원, 화단, 길가 꽃 사진",
        "tipExample": "꽃 중심이 화면 안에서 크게 보이도록 배치해보세요.",
        "approxAperture": "f/1.8~2.8",
        "approxShutterSpeed": "1/125 이상",
        "approxISO": "100~200",
        "focusHint": "꽃술이나 꽃잎 가장자리",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/flower-close-01.jpg",
            "label": "꽃잎 디테일",
            "alt": "꽃 접사 예시"
          },
          {
            "src": "/samples/shooting-guide/flower-close-02.jpg",
            "label": "배경 흐림 예시",
            "alt": "배경을 흐리게 처리한 꽃 접사 예시"
          }
        ],
        "recommendedCopyDirection": [
          "작지만 분명하게 남는 순간",
          "가까이 볼수록 더 예쁜 장면",
          "가까이 담으니 마음도 선명하다"
        ]
      }
    ]
  },
  {
    "situation": "실외",
    "subject": "자동차",
    "distance": "medium",
    "tips": [
      {
        "tipTitle": "대각선 구도로 차체 살리기",
        "tipShort": "정면보다 앞쪽 45도 각도로 찍어보세요.",
        "tipDetail": "자동차는 측면 라인과 앞면이 함께 보일 때 형태가 더 잘 살아납니다.",
        "tipWhy": "차체 라인과 입체감이 동시에 드러납니다.",
        "tipWhen": "주차장, 도로변, 야외 자동차 사진",
        "tipExample": "헤드라이트와 측면 라인이 같이 보이게 서서 찍어보세요.",
        "approxShutterSpeed": "1/125 이상",
        "approxISO": "100~200",
        "lensHint": "중간 줌이나 2배 전후가 왜곡을 줄이기 좋습니다.",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/car-outdoor-medium-01.jpg",
            "label": "45도 각도 예시",
            "alt": "실외 자동차 중간 거리 예시"
          },
          {
            "src": "/samples/shooting-guide/car-outdoor-medium-02.jpg",
            "label": "차체 라인 강조",
            "alt": "차체 라인을 강조한 자동차 예시"
          }
        ],
        "recommendedCopyDirection": [
          "장면도 감정도 함께 담기는 순간",
          "오늘의 분위기가 가장 잘 남는 거리",
          "설명하지 않아도 분위기가 전해진다"
        ]
      }
    ]
  },
  {
    "situation": "흐림",
    "subject": "산",
    "distance": "wide",
    "tips": [
      {
        "tipTitle": "산의 층을 나눠 담기",
        "tipShort": "앞산과 뒷산의 겹침이 보이게 찍어보세요.",
        "tipDetail": "흐린 날은 화려한 색보다 겹치는 산의 깊이감이 포인트가 됩니다.",
        "tipWhy": "색이 적어도 공간감이 살아납니다.",
        "tipWhen": "안개 낀 산, 흐린 하늘, 먼 풍경",
        "tipExample": "전경 나무 한 줄과 멀리 산을 함께 담아보세요.",
        "approxAperture": "f/5.6~8",
        "approxShutterSpeed": "1/125 이상",
        "approxISO": "100~400",
        "exampleImages": [
          {
            "src": "/samples/shooting-guide/mountain-cloudy-wide-01.jpg",
            "label": "안개와 층 강조",
            "alt": "흐린 날 산 원경 예시"
          },
          {
            "src": "/samples/shooting-guide/mountain-cloudy-wide-02.jpg",
            "label": "넓은 산세 구도",
            "alt": "산 전체를 넓게 담은 예시"
          }
        ],
        "recommendedCopyDirection": [
          "공간 전체가 감정이 되는 순간",
          "장면보다 오래 남는 분위기",
          "멀리서 봐야 더 잘 보이는 장면"
        ]
      }
    ]
  }
]
```

---

# 8. 샘플 이미지가 아직 없을 때 임시 운영 방법

실제 샘플 사진 파일이 아직 없다면 아래처럼 먼저 운영할 수 있다.

## 방법 A
exampleImages 필드는 유지하되 비워둔다.

```json
"exampleImages": []
```

## 방법 B
같은 구조로 placeholder 이미지를 연결한다.

예:
- `/samples/placeholders/coming-soon-1.jpg`

## 방법 C
라벨만 먼저 보여주고 이미지는 추후 연결한다.

예:
- `label: "수평선 낮게 배치 예시"`

---

# 9. Codex 실행 프롬프트

현재 촬영 가이드를 더 직관적으로 만들기 위해
거리(distance)와 예시 이미지(exampleImages), 거리별 추천 문구 방향을 추가해.

요구:
1. 촬영 가이드 입력 구조에 distance 추가
   - close_up
   - medium
   - wide

2. 각 팁에 exampleImages 필드 추가
   - 1~2장 예시 이미지
   - src / label / alt 구조

3. 각 팁에 recommendedCopyDirection 추가
   - 거리 특성에 맞는 문구 방향 2~3개

4. 기본 UI
   - 상황 / 대상 / 거리 선택
   - 기본 팁 카드 노출

5. 자세히 보기 / 툴팁
   - 상세 설명
   - 촬영 설정값
   - 예시 이미지
   - 추천 문구 방향

중요:
- 기본 화면은 짧게 유지
- 예시 이미지는 1~2장만
- 미리보기/결과 생성 구조는 건드리지 말 것

결과:
1. distance 적용 방식
2. exampleImages 연결 방식
3. recommendedCopyDirection 연결 방식
4. PASS / HOLD
5. 다음 단계 1개
