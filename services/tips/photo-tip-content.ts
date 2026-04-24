import type { PhotoStyleType } from "@/lib/types/analysis";
import type { PhotoTip } from "@/services/tips/photo-tip-types";

type PhotoTipTemplate = Omit<PhotoTip, "tooltipKey">;

const healingTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "주제를 한쪽에 두기",
    short: "중앙을 살짝 비워보세요. 여백이 생기면 편안한 분위기가 더 살아납니다.",
  },
  {
    category: "lighting",
    title: "밝은 빛은 부드럽게",
    short: "햇빛이 강하면 그늘 쪽에서 다시 잡아보세요. 색이 더 차분해집니다.",
  },
  {
    category: "color",
    title: "초록과 따뜻한 톤 유지",
    short: "채도는 조금만 올려보세요. 자연스러운 회복감이 더 잘 보입니다.",
  },
  {
    category: "retake",
    title: "한 걸음 물러서기",
    short: "다시 찍는다면 한 걸음 물러서세요. 공간감이 생기고 답답함이 줄어듭니다.",
  },
  {
    category: "device",
    title: "기본 렌즈 먼저 사용",
    short: "일반 스마트폰은 기본 렌즈로 찍어보세요. 왜곡이 적고 분위기가 안정됩니다.",
  },
];

const reflectiveTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "길의 방향 살리기",
    short: "시선이 이어지는 방향을 조금 더 비워보세요. 생각의 흐름이 자연스러워집니다.",
  },
  {
    category: "lighting",
    title: "어두운 부분 남기기",
    short: "어둠을 조금 남겨보세요. 여운이 더 자연스럽게 살아납니다.",
  },
  {
    category: "color",
    title: "색은 적게 쓰기",
    short: "색감을 차분하게 유지해보세요. 사색적인 분위기가 좋아집니다.",
  },
  {
    category: "retake",
    title: "시선 높이 낮추기",
    short: "다시 찍는다면 카메라를 조금 낮춰보세요. 길의 깊이가 더 잘 보입니다.",
  },
  {
    category: "device",
    title: "초점은 앞쪽에 고정",
    short: "앞쪽 피사체를 눌러 초점을 잡아보세요. 화면이 더 또렷하게 정리됩니다.",
  },
];

const actionTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "진행 방향 비워두기",
    short: "차가 향하는 쪽을 조금 더 비워보세요. 속도감이 더 강하게 살아납니다.",
  },
  {
    category: "lighting",
    title: "차체 밝기 먼저 맞추기",
    short: "연기 속에서도 차체가 보이게 밝기를 살짝 올려보세요. 힘이 더 또렷해집니다.",
  },
  {
    category: "color",
    title: "차량 색은 선명하게",
    short: "배경 대비는 조금 낮추고 차량 색은 살려보세요. 주제가 바로 들어옵니다.",
  },
  {
    category: "retake",
    title: "코너 탈출 순간 잡기",
    short: "다시 찍는다면 코너를 빠져나오는 순간을 연속 촬영으로 잡아보세요.",
  },
  {
    category: "device",
    title: "망원으로 압축감 주기",
    short: "Galaxy Ultra 계열은 3배 줌으로 떨어져 찍어보세요. 속도와 압축감이 강해집니다.",
  },
];

const travelTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "입구와 길 살리기",
    short: "건물이나 골목의 시작점을 함께 담아보세요. 여행의 흐름이 더 잘 보입니다.",
  },
  {
    category: "lighting",
    title: "옆빛 시간 활용",
    short: "정오보다 아침이나 늦은 오후에 찍어보세요. 공간의 결이 더 부드럽게 남습니다.",
  },
  {
    category: "color",
    title: "따뜻한 색 유지",
    short: "따뜻한 색온도를 유지해보세요. 기억에 가까운 분위기가 살아납니다.",
  },
  {
    category: "retake",
    title: "사람이 지나간 뒤 찍기",
    short: "다시 찍는다면 잠깐 기다려보세요. 공간의 고요함이 더 잘 드러납니다.",
  },
  {
    category: "device",
    title: "광각은 조금만",
    short: "넓게 담되 가장자리가 휘지 않게 한 발 물러서서 찍어보세요.",
  },
];

const urbanTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "선과 간판 정리",
    short: "건물 선을 화면 끝과 맞춰보세요. 도시 분위기가 더 깔끔하게 정리됩니다.",
  },
  {
    category: "lighting",
    title: "밝은 간판 기준 맞추기",
    short: "간판이나 조명이 강하면 밝기를 살짝 낮춰보세요. 분위기가 더 깊어집니다.",
  },
  {
    category: "color",
    title: "한 가지 색만 강조",
    short: "눈에 띄는 색 하나만 살려보세요. 화면의 집중도가 높아집니다.",
  },
  {
    category: "retake",
    title: "사람 흐름 기다리기",
    short: "다시 찍는다면 사람이 지나가는 타이밍을 기다려보세요. 장면에 리듬이 생깁니다.",
  },
  {
    category: "device",
    title: "야간 모드는 짧게",
    short: "손떨림이 보이면 야간 모드 시간을 줄여보세요. 선명도가 더 안정됩니다.",
  },
];

const defaultTips: PhotoTipTemplate[] = [
  {
    category: "composition",
    title: "주제 주변 정리",
    short: "가장 보여주고 싶은 대상 주변을 조금 비워보세요. 시선이 더 쉽게 모입니다.",
  },
  {
    category: "lighting",
    title: "밝기 먼저 맞추기",
    short: "주제를 눌러 밝기를 맞춰보세요. 사진의 첫인상이 더 안정됩니다.",
  },
  {
    category: "color",
    title: "색은 한 단계만",
    short: "채도는 한 단계만 조정해보세요. 자연스러운 느낌을 유지하기 좋습니다.",
  },
  {
    category: "retake",
    title: "한 장 더 넓게",
    short: "다시 찍는다면 조금 더 넓게 담아보세요. 나중에 자르기 쉬워집니다.",
  },
  {
    category: "device",
    title: "렌즈를 닦고 시작",
    short: "촬영 전 렌즈를 한번 닦아보세요. 빛 번짐과 흐림이 줄어듭니다.",
  },
];

export const photoTipTemplatesByStyle: Record<PhotoStyleType, PhotoTipTemplate[]> = {
  emotional_landscape: reflectiveTips,
  spring_healing: healingTips,
  lonely_night: reflectiveTips,
  reflective_fog: reflectiveTips,
  travel_korean: travelTips,
  natural_healing: healingTips,
  action_speed: actionTips,
  sports_energy: actionTips,
  urban_mood: urbanTips,
  other: defaultTips,
};
