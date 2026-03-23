export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '금융시스템매니저';

export const TICKET_TYPES = {
  as: { label: 'A/S', color: '#333333' },
  install: { label: '설치', color: '#555555' },
  paper: { label: '용지', color: '#666666' },
  inspect: { label: '점검', color: '#777777' },
  sales: { label: '영업', color: '#444444' },
  other: { label: '기타', color: '#999999' },
} as const;

export const TICKET_STATUS = {
  pending: { label: '대기', color: '#B8860B', bg: 'bg-amber-50', text: 'text-amber-700' },
  accepted: { label: '수락', color: '#333333', bg: 'bg-gray-100', text: 'text-gray-800' },
  in_progress: { label: '처리 중', color: '#333333', bg: 'bg-gray-100', text: 'text-gray-800' },
  completed: { label: '완료', color: '#2D8A4E', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: '취소', color: '#999999', bg: 'bg-gray-50', text: 'text-gray-400' },
} as const;

export const PRIORITY = {
  urgent: { label: '긴급', color: '#CC3333' },
  normal: { label: '일반', color: '#999999' },
  low: { label: '여유', color: '#2D8A4E' },
} as const;

export const SALES_STATUS = {
  prospecting: { label: '영업 중', color: '#B8860B' },
  contracted: { label: '계약 완료', color: '#333333' },
  install_scheduled: { label: '설치 예정', color: '#555555' },
  installing: { label: '설치 중', color: '#444444' },
  completed: { label: '완료', color: '#2D8A4E' },
  cancelled: { label: '취소', color: '#999999' },
} as const;

export const PAPER_TYPES = {
  pos: { label: '포스(3인치)', unit: '봉지', boxUnit: 25, lowThreshold: 50 },
  thermal: { label: '천용지(2인치)', unit: '봉지', boxUnit: 25, lowThreshold: 50 },
  portable: { label: '휴대용 용지', unit: '봉지', boxUnit: 5, lowThreshold: 10 },
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
  external: { label: '외부접수', badge: '외부' },
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
