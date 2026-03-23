export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '금융시스템매니저';

export const TICKET_TYPES = {
  as: { label: 'A/S', color: '#FF3B30' },
  install: { label: '설치', color: '#007AFF' },
  paper: { label: '용지', color: '#34C759' },
  inspect: { label: '점검', color: '#AF52DE' },
  sales: { label: '영업', color: '#FF9500' },
  other: { label: '기타', color: '#8E8E93' },
} as const;

export const TICKET_STATUS = {
  pending: { label: '대기 중', color: '#FF9500', bg: 'bg-orange-50', text: 'text-orange-600' },
  accepted: { label: '수락됨', color: '#007AFF', bg: 'bg-blue-50', text: 'text-blue-600' },
  in_progress: { label: '처리 중', color: '#007AFF', bg: 'bg-blue-50', text: 'text-blue-600' },
  completed: { label: '완료', color: '#34C759', bg: 'bg-green-50', text: 'text-green-600' },
  cancelled: { label: '취소', color: '#8E8E93', bg: 'bg-gray-50', text: 'text-gray-500' },
} as const;

export const PRIORITY = {
  urgent: { label: '긴급', color: '#FF3B30' },
  normal: { label: '일반', color: '#8E8E93' },
  low: { label: '여유', color: '#34C759' },
} as const;

export const SALES_STATUS = {
  prospecting: { label: '영업 중', color: '#FF9500' },
  contracted: { label: '계약 완료', color: '#007AFF' },
  install_scheduled: { label: '설치 예정', color: '#AF52DE' },
  installing: { label: '설치 중', color: '#5856D6' },
  completed: { label: '완료', color: '#34C759' },
  cancelled: { label: '취소', color: '#8E8E93' },
} as const;

export const PAPER_TYPES = {
  pos: { label: 'POS 용지', unit: '봉지', boxUnit: 20, lowThreshold: 40 },
  thermal: { label: '감열지', unit: '개', boxUnit: 10, lowThreshold: 15 },
  portable: { label: '휴대용', unit: '개', boxUnit: 5, lowThreshold: 10 },
} as const;

export const ROLES = {
  admin: { label: '관리자' },
  office: { label: '사무직' },
  field: { label: '현장직' },
} as const;

export const EQUIPMENT_TYPES = {
  card_terminal: { label: '카드단말기' },
  pos: { label: 'POS' },
  kiosk: { label: '키오스크' },
  table_order: { label: '테이블오더' },
  printer: { label: '프린터' },
  other: { label: '기타' },
} as const;

export const TICKET_SOURCE = {
  internal: { label: '내부접수', badge: '' },
  external: { label: '외부접수', badge: '🌐 외부접수' },
} as const;

export const REGIONS = ['여수', '순천', '광양', '기타'] as const;

export const SALES_CHECKLIST_TEMPLATE = {
  '사업자등록증_수취': false,
  '계약서_작성': false,
  '매장_실측_완료': false,
  '메뉴_확인_완료': false,
  '프로그램_선정': false,
  'VAN사_선정': false,
  '카운터_인터넷_확인': false,
  '오픈예정일_확인': false,
};

export const INSTALL_CHECKLIST_TEMPLATE = {
  '장비_출고_확인': false,
  '카운터_설치': false,
  '인터넷_연결': false,
  'POS_프로그램_설치': false,
  '카드단말기_연동': false,
  '테스트결제_완료': false,
  '프로그램_사용법_교육': false,
  '오늘얼마_어플_설치': false,
  '설치완료_사진_업로드': false,
  '재부팅_OS_구동_확인': false,
};
