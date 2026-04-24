import type {
  ShootingGuideDeviceType,
  ShootingGuideOption,
  ShootingDistance,
  ShootingSituation,
  ShootingSubject,
  ShootingTip,
  ShootingTipMapping,
} from "@/services/shooting-guide/shooting-guide-types";

export const shootingGuideSituations: ShootingGuideOption<ShootingSituation>[] = [
  { value: "rain", label: "비" },
  { value: "snow", label: "눈" },
  { value: "cloudy", label: "흐림" },
  { value: "sunny", label: "맑음" },
  { value: "sunset", label: "노을" },
  { value: "backlight", label: "역광" },
  { value: "night", label: "야경" },
  { value: "concert", label: "공연" },
  { value: "indoor", label: "실내" },
  { value: "natural_light", label: "자연광" },
];

export const shootingGuideDeviceTypes: ShootingGuideOption<ShootingGuideDeviceType>[] = [
  { value: "galaxy_s25_ultra", label: "Galaxy S25 Ultra" },
  { value: "galaxy_s26_ultra", label: "Galaxy S26 Ultra" },
  { value: "generic_smartphone", label: "일반 스마트폰" },
];

export const shootingGuideSubjects: ShootingGuideOption<ShootingSubject>[] = [
  { value: "person", label: "인물" },
  { value: "food", label: "음식" },
  { value: "landscape", label: "풍경" },
  { value: "sea", label: "바다" },
  { value: "mountain", label: "산" },
  { value: "flower", label: "꽃" },
  { value: "car", label: "자동차" },
  { value: "product", label: "제품" },
  { value: "pet", label: "반려동물" },
  { value: "street", label: "거리" },
];

export const shootingGuideDistances: ShootingGuideOption<ShootingDistance>[] = [
  { value: "close_up", label: "접사" },
  { value: "medium", label: "중간" },
  { value: "wide", label: "원경" },
];

const defaultTips: ShootingTip[] = [
  {
    tipTitle: "주제 주변 정리",
    tipShort: "가장 보여주고 싶은 대상 주변을 조금 비워보세요.",
    tipDetail: "주변 정보가 정리되면 사진의 중심이 더 빨리 전달됩니다.",
    tipWhy: "배경이 복잡하면 사용자가 무엇을 봐야 할지 늦게 이해합니다.",
    tipWhen: "대부분의 일상 사진",
    tipExample: "주제 옆 작은 물건을 한두 개만 치워도 훨씬 정리돼 보입니다.",
    approxWhiteBalance: "4500K~6500K",
    approxShutterSpeed: "1/60 이상",
    approxISO: "100~800",
    focusHint: "가장 보여주고 싶은 부분을 눌러 초점을 잡으세요.",
    exampleImages: [
      {
        src: "/samples/shooting-guide/default-medium.jpg",
        fallbackSrc: "/samples/default_medium.svg",
        label: "주제 주변 정리 예시",
      },
    ],
  },
];

const subjectFallbackTips: Record<ShootingSubject, ShootingTip[]> = {
  person: [
    {
      tipTitle: "얼굴 밝기 먼저 맞추기",
      tipShort: "얼굴에 초점과 밝기를 먼저 맞춰보세요.",
      tipDetail: "인물 사진은 얼굴 밝기가 안정되면 표정이 더 자연스럽게 보입니다.",
      tipWhy: "배경 밝기에 맞추면 얼굴이 어둡게 묻힐 수 있습니다.",
      tipWhen: "실내, 역광, 거리 인물 사진",
      tipExample: "얼굴을 터치한 뒤 밝기 슬라이더를 조금 조정해보세요.",
      approxExposureComp: "0~+0.7",
      focusHint: "눈 주변에 초점을 고정하세요.",
    },
  ],
  food: [
    {
      tipTitle: "옆빛으로 입체감 만들기",
      tipShort: "옆에서 들어오는 빛을 활용하세요.",
      tipDetail: "음식은 옆빛을 받으면 높이와 질감이 더 잘 살아납니다.",
      tipWhy: "정면 빛은 음식이 평면적으로 보이기 쉽습니다.",
      tipWhen: "실내 음식, 카페, 디저트 사진",
      tipExample: "접시를 창가 옆에 두고 45도 각도에서 찍어보세요.",
      approxWhiteBalance: "3200K~5200K",
      approxAperture: "f/1.8~2.8",
    },
  ],
  landscape: [
    {
      tipTitle: "수평 먼저 맞추기",
      tipShort: "하늘과 땅의 선을 먼저 맞춰보세요.",
      tipDetail: "풍경 사진은 수평이 맞으면 전체 인상이 안정됩니다.",
      tipWhy: "수평이 기울면 의도보다 불안정하게 보일 수 있습니다.",
      tipWhen: "바다, 산, 들판, 도시 풍경",
      tipExample: "하늘이 좋으면 수평선을 아래쪽으로 내려보세요.",
      approxAperture: "f/5.6~8",
      approxISO: "100~400",
    },
  ],
  sea: [
    {
      tipTitle: "수평선 정리하기",
      tipShort: "수평선을 위나 아래로 배치해보세요.",
      tipDetail: "수평선이 중앙에 있으면 사진이 밋밋해 보일 수 있습니다.",
      tipWhy: "하늘이나 바다 중 무엇을 보여줄지 정하면 구도가 더 강해집니다.",
      tipWhen: "바다, 호수, 노을 풍경",
      tipExample: "하늘을 강조하려면 수평선을 아래로 내리세요.",
      approxWhiteBalance: "5000K~6500K",
      approxAperture: "f/5.6~8",
      approxShutterSpeed: "1/125 이상",
      approxISO: "100~200",
    },
  ],
  mountain: [
    {
      tipTitle: "앞쪽 요소 넣기",
      tipShort: "앞쪽에 길이나 나무를 살짝 넣어보세요.",
      tipDetail: "전경이 있으면 산 풍경이 더 깊고 입체적으로 보입니다.",
      tipWhy: "먼 산만 담으면 거리감이 약하게 느껴질 수 있습니다.",
      tipWhen: "산, 숲, 전망대 풍경",
      tipExample: "길이나 난간을 화면 아래쪽에 조금 남겨보세요.",
      approxAperture: "f/5.6~8",
      approxISO: "100~400",
    },
  ],
  flower: [
    {
      tipTitle: "가까이 찍기",
      tipShort: "꽃을 화면에 크게 담아보세요.",
      tipDetail: "꽃이 작게 보이면 색과 형태의 존재감이 약해집니다.",
      tipWhy: "주제가 커질수록 사진의 포인트가 더 분명해집니다.",
      tipWhen: "맑은 날 꽃, 봄꽃, 정원 사진",
      tipExample: "꽃잎 가장자리가 화면에 꽉 차게 가까이 가보세요.",
      approxAperture: "f/1.8~2.8",
      focusHint: "가장 선명하게 보일 꽃잎에 초점을 맞추세요.",
    },
  ],
  car: [
    {
      tipTitle: "각도 살리기",
      tipShort: "앞쪽 45도 구도로 찍어보세요.",
      tipDetail: "정면보다 사선 구도가 차체의 길이와 힘을 더 잘 보여줍니다.",
      tipWhy: "자동차 사진은 선과 방향이 살아야 더 역동적으로 보입니다.",
      tipWhen: "실외 자동차, 전시 차량, 주행 전 정지 컷",
      tipExample: "앞범퍼와 옆라인이 함께 보이는 위치에서 찍어보세요.",
      approxShutterSpeed: "1/125 이상",
      lensHint: "2~3배 줌으로 조금 떨어지면 차체 왜곡이 줄어듭니다.",
    },
  ],
  product: [
    {
      tipTitle: "배경 단순화",
      tipShort: "제품 주변 물건을 정리하세요.",
      tipDetail: "배경이 단순할수록 제품의 형태와 질감이 더 잘 보입니다.",
      tipWhy: "제품보다 주변 물건이 먼저 보이면 판매 이미지로 쓰기 어렵습니다.",
      tipWhen: "제품, 소품, 판매용 이미지",
      tipExample: "책상 위 케이블과 종이를 치우고 제품만 남겨보세요.",
      approxWhiteBalance: "4500K~6000K",
      focusHint: "로고나 앞쪽 모서리에 초점을 맞추세요.",
    },
  ],
  pet: [
    {
      tipTitle: "눈높이로 낮추기",
      tipShort: "반려동물 눈높이에 맞춰 낮게 찍어보세요.",
      tipDetail: "카메라가 낮아지면 표정과 시선이 더 자연스럽게 보입니다.",
      tipWhy: "위에서 내려찍으면 몸이 작아 보이고 표정 전달이 약해집니다.",
      tipWhen: "집, 카페, 산책 중 반려동물 사진",
      tipExample: "바닥에 앉아 눈 주변을 터치한 뒤 여러 장 찍어보세요.",
      approxShutterSpeed: "1/250 이상",
      focusHint: "눈이나 코 주변에 초점을 맞추세요.",
    },
  ],
  street: [
    {
      tipTitle: "빛 반사 활용하기",
      tipShort: "바닥 반사를 활용해보세요.",
      tipDetail: "젖은 바닥이나 유리창은 빛을 반사해 분위기를 만듭니다.",
      tipWhy: "일반 거리 사진보다 감정과 공간감이 더 살아납니다.",
      tipWhen: "비 오는 날 거리, 밤거리, 네온 간판 주변",
      tipExample: "가로등 빛이 반사된 길을 낮은 각도에서 찍어보세요.",
      approxISO: "200~800",
      approxShutterSpeed: "1/60 이상",
    },
  ],
};

export const shootingGuideMappings: ShootingTipMapping[] = [
  {
    situation: "sunset",
    subject: "sea",
    distance: "wide",
    tips: [
      {
        tipTitle: "수평선 정리하기",
        tipShort: "수평선을 위나 아래로 배치해보세요.",
        tipDetail: "수평선이 중앙에 있으면 사진이 밋밋해 보일 수 있습니다.",
        tipWhy: "구도가 변하면 노을과 바다 중 강조점이 더 분명해집니다.",
        tipWhen: "바다, 호수, 노을 풍경",
        tipExample: "하늘을 강조하려면 수평선을 아래로 내리세요.",
        approxWhiteBalance: "5000K~6500K",
        approxAperture: "f/5.6~8",
        approxShutterSpeed: "1/125 이상",
        approxISO: "100~200",
        exampleImages: [
          {
            src: "/samples/shooting-guide/sunset-beach-wide-01.jpg",
            fallbackSrc: "/samples/sunset_beach_wide_1.svg",
            label: "수평선 낮게 배치",
          },
          {
            src: "/samples/shooting-guide/sunset-beach-wide-02.jpg",
            fallbackSrc: "/samples/sunset_beach_wide_2.svg",
            label: "하늘 강조 구도",
          },
        ],
      },
    ],
  },
  {
    situation: "backlight",
    subject: "person",
    distance: "medium",
    tips: [
      {
        tipTitle: "얼굴 밝기 먼저 맞추기",
        tipShort: "얼굴에 초점을 맞춰 밝기를 조절하세요.",
        tipDetail: "역광에서는 얼굴이 어둡게 나오기 쉽습니다.",
        tipWhy: "주인공이 보여야 사진이 살아납니다.",
        tipWhen: "창가, 노을 인물 사진",
        tipExample: "얼굴을 터치한 뒤 밝기를 올려주세요.",
        approxExposureComp: "+0.3~+1.0",
        focusHint: "눈 주변을 길게 눌러 초점과 밝기를 고정하세요.",
        phoneCameraHint: "화면을 길게 눌러 초점과 밝기를 같이 잡아보세요.",
        exampleImages: [
          {
            src: "/samples/shooting-guide/backlight-person-medium-01.jpg",
            fallbackSrc: "/samples/portrait_medium_1.svg",
            label: "얼굴 밝기 우선",
          },
        ],
      },
    ],
  },
  {
    situation: "rain",
    subject: "street",
    distance: "wide",
    tips: [
      {
        tipTitle: "빛 반사 활용하기",
        tipShort: "바닥 반사를 활용해보세요.",
        tipDetail: "젖은 바닥은 빛을 반사해 분위기를 만듭니다.",
        tipWhy: "일반 거리 사진보다 감성이 살아납니다.",
        tipWhen: "비 오는 날 야외",
        tipExample: "가로등 빛이 반사된 길을 찍어보세요.",
        approxISO: "200~800",
        approxShutterSpeed: "1/60 이상",
        exampleImages: [
          {
            src: "/samples/shooting-guide/rainy-street-wide-01.jpg",
            fallbackSrc: "/samples/rain_street_wide_1.svg",
            label: "젖은 바닥 반사",
          },
        ],
      },
    ],
  },
  {
    situation: "snow",
    subject: "landscape",
    distance: "wide",
    tips: [
      {
        tipTitle: "노출 낮추기",
        tipShort: "조금 어둡게 찍어보세요.",
        tipDetail: "눈은 자동으로 너무 밝게 찍히기 쉽습니다.",
        tipWhy: "하얗게 날아가는 것을 방지합니다.",
        tipWhen: "눈밭, 설경, 겨울 거리",
        tipExample: "노출을 -0.3 정도 낮추세요.",
        approxExposureComp: "-0.3~-1.0",
        approxISO: "100~400",
        exampleImages: [
          {
            src: "/samples/shooting-guide/snow-landscape-wide-01.jpg",
            fallbackSrc: "/samples/snow_landscape_wide_1.svg",
            label: "눈 밝기 보존",
          },
        ],
      },
    ],
  },
  {
    situation: "night",
    subject: "landscape",
    distance: "wide",
    tips: [
      {
        tipTitle: "손떨림 방지",
        tipShort: "고정해서 찍어보세요.",
        tipDetail: "야경은 셔터속도가 느려 흔들림이 쉽게 생깁니다.",
        tipWhy: "흔들림만 줄여도 선명도가 크게 좋아집니다.",
        tipWhen: "야경, 밤거리, 조명이 많은 풍경",
        tipExample: "벽이나 난간에 기대어 찍어보세요.",
        approxShutterSpeed: "1/10~1초",
        approxISO: "100~400",
        exampleImages: [
          {
            src: "/samples/shooting-guide/night-landscape-wide-01.jpg",
            fallbackSrc: "/samples/night_landscape_wide_1.svg",
            label: "고정 야경 구도",
          },
        ],
      },
    ],
  },
  {
    situation: "indoor",
    subject: "food",
    distance: "close_up",
    tips: [
      {
        tipTitle: "빛 방향 맞추기",
        tipShort: "옆에서 들어오는 빛을 활용하세요.",
        tipDetail: "정면 빛은 음식이 평면적으로 보일 수 있습니다.",
        tipWhy: "옆빛은 음식의 입체감과 질감을 살립니다.",
        tipWhen: "실내 음식, 카페, 디저트 사진",
        tipExample: "창가 옆에서 45도 각도로 촬영해보세요.",
        approxWhiteBalance: "3200K~4200K",
        approxAperture: "f/1.8~2.8",
        exampleImages: [
          {
            src: "/samples/shooting-guide/indoor-food-close-01.jpg",
            fallbackSrc: "/samples/food_close_1.svg",
            label: "질감 강조",
          },
        ],
      },
    ],
  },
  {
    situation: "concert",
    subject: "person",
    distance: "medium",
    tips: [
      {
        tipTitle: "셔터 빠르게",
        tipShort: "움직임을 멈추세요.",
        tipDetail: "공연은 움직임이 많아 느린 셔터에서는 쉽게 흐려집니다.",
        tipWhy: "표정과 손동작이 선명해야 장면의 힘이 살아납니다.",
        tipWhen: "공연, 무대, 행사 인물 사진",
        tipExample: "손동작이 멈추는 순간을 연속 촬영으로 잡아보세요.",
        approxShutterSpeed: "1/250 이상",
        approxISO: "800~1600",
        exampleImages: [
          {
            src: "/samples/shooting-guide/concert-person-medium-01.jpg",
            fallbackSrc: "/samples/concert_person_medium_1.svg",
            label: "움직임 포착",
          },
        ],
      },
    ],
  },
  {
    situation: "sunny",
    subject: "flower",
    distance: "close_up",
    tips: [
      {
        tipTitle: "가까이 찍기",
        tipShort: "꽃을 크게 담아보세요.",
        tipDetail: "꽃이 작게 찍히면 존재감이 약해집니다.",
        tipWhy: "포인트가 커질수록 사진의 중심이 분명해집니다.",
        tipWhen: "맑은 날 꽃, 정원, 봄꽃 사진",
        tipExample: "꽃을 화면 가득 채워보세요.",
        approxExposureComp: "-0.3~0",
        focusHint: "꽃잎 가장자리보다 중심부에 초점을 맞춰보세요.",
        exampleImages: [
          {
            src: "/samples/shooting-guide/flower-close-01.jpg",
            fallbackSrc: "/samples/flower_close_1.svg",
            label: "꽃 화면 가득",
          },
        ],
      },
    ],
  },
  {
    situation: "sunny",
    subject: "car",
    distance: "medium",
    tips: [
      {
        tipTitle: "각도 살리기",
        tipShort: "대각선 구도로 찍어보세요.",
        tipDetail: "정면보다 앞쪽 45도 구도가 더 역동적으로 보입니다.",
        tipWhy: "차체 라인과 방향감이 함께 살아납니다.",
        tipWhen: "실외 자동차, 전시 차량, 주행 전 정지 컷",
        tipExample: "앞쪽 45도 각도에서 차체 라인을 길게 담아보세요.",
        approxShutterSpeed: "1/125 이상",
        approxISO: "100~400",
        exampleImages: [
          {
            src: "/samples/shooting-guide/car-outdoor-medium-01.jpg",
            fallbackSrc: "/samples/car_medium_1.svg",
            label: "앞쪽 45도 구도",
          },
        ],
      },
    ],
  },
  {
    situation: "default",
    subject: "person",
    distance: "default",
    tips: subjectFallbackTips.person,
  },
  {
    situation: "default",
    subject: "food",
    distance: "default",
    tips: subjectFallbackTips.food,
  },
  {
    situation: "default",
    subject: "landscape",
    distance: "default",
    tips: subjectFallbackTips.landscape,
  },
  {
    situation: "default",
    subject: "sea",
    distance: "default",
    tips: subjectFallbackTips.sea,
  },
  {
    situation: "default",
    subject: "mountain",
    distance: "default",
    tips: subjectFallbackTips.mountain,
  },
  {
    situation: "default",
    subject: "flower",
    distance: "default",
    tips: subjectFallbackTips.flower,
  },
  {
    situation: "default",
    subject: "car",
    distance: "default",
    tips: subjectFallbackTips.car,
  },
  {
    situation: "default",
    subject: "product",
    distance: "default",
    tips: subjectFallbackTips.product,
  },
  {
    situation: "default",
    subject: "pet",
    distance: "default",
    tips: subjectFallbackTips.pet,
  },
  {
    situation: "default",
    subject: "street",
    distance: "default",
    tips: subjectFallbackTips.street,
  },
  {
    situation: "default",
    subject: "default",
    distance: "default",
    tips: defaultTips,
  },
];
