/**
 * 밴드/메신저에서 복사한 텍스트를 파싱하여 티켓 필드를 추출합니다.
 *
 * 예시 입력:
 * 엔젤
 * 전남 여수시 여문1로 46-1 (여서동)
 * KIS-3210
 * 010-9659-6938
 * .
 * 단말기에 연결된 전화기 교체 후 단말기가 안된다고 하세요
 * 빠른방문 요청하십니다
 */

interface ParsedTicket {
  store_name: string;
  store_address: string;
  store_phone: string;
  equipment: string;
  description: string;
  title: string;
}

// 전화번호 패턴
const PHONE_REGEX = /^(0\d{1,2}[- ]?\d{3,4}[- ]?\d{4})$/;

// 주소 패턴 (시/군/구 + 로/길/동)
const ADDRESS_REGEX = /(전남|전북|경남|경북|충남|충북|강원|제주|서울|부산|대구|인천|광주|대전|울산|세종|경기)?\s*(여수|순천|광양|목포|나주|무안|해남|완도|강진|장흥|보성|고흥|담양|곡성|구례|화순|영광|장성|함평|신안|영암|진도|완주|군산|익산|전주|정읍|남원|김제|부안|임실|순창|고창|무주|진안|장수)/;
const ADDRESS_DETAIL_REGEX = /(시|군|구)\s+\S*(로|길|동|읍|면|리)/;

// 장비 키워드
const EQUIPMENT_KEYWORDS = ['KIS', 'POS', 'VAN', 'CAT', '키오스크', '단말기', '프린터', '테이블오더'];
const EQUIPMENT_REGEX = new RegExp(`(${EQUIPMENT_KEYWORDS.join('|')})[\\s,\\-]*(\\S*)`, 'i');

// 구분자 (증상 시작 전 구분)
const SEPARATOR_REGEX = /^[\.\-_=~·]{1,5}$/;

export function parseTicketText(text: string): ParsedTicket {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const result: ParsedTicket = {
    store_name: '',
    store_address: '',
    store_phone: '',
    equipment: '',
    description: '',
    title: '',
  };

  const descLines: string[] = [];
  let foundSeparator = false;
  const usedIndices = new Set<number>();

  // 1차: 전화번호 찾기
  for (let i = 0; i < lines.length; i++) {
    const cleaned = lines[i].replace(/[\s]/g, '');
    if (PHONE_REGEX.test(cleaned) || PHONE_REGEX.test(lines[i])) {
      result.store_phone = lines[i];
      usedIndices.add(i);
      break;
    }
  }

  // 2차: 주소 찾기
  for (let i = 0; i < lines.length; i++) {
    if (usedIndices.has(i)) continue;
    if (ADDRESS_REGEX.test(lines[i]) || ADDRESS_DETAIL_REGEX.test(lines[i])) {
      result.store_address = lines[i];
      usedIndices.add(i);
      break;
    }
  }

  // 3차: 장비 찾기
  for (let i = 0; i < lines.length; i++) {
    if (usedIndices.has(i)) continue;
    if (EQUIPMENT_REGEX.test(lines[i])) {
      result.equipment = lines[i];
      usedIndices.add(i);
      break;
    }
  }

  // 4차: 구분자 찾기
  for (let i = 0; i < lines.length; i++) {
    if (usedIndices.has(i)) continue;
    if (SEPARATOR_REGEX.test(lines[i])) {
      usedIndices.add(i);
      foundSeparator = true;
      // 구분자 이후는 전부 증상
      for (let j = i + 1; j < lines.length; j++) {
        if (!usedIndices.has(j)) {
          descLines.push(lines[j]);
          usedIndices.add(j);
        }
      }
      break;
    }
  }

  // 5차: 거래처명 = 주소/전화/장비/구분자가 아닌 첫 번째 줄
  for (let i = 0; i < lines.length; i++) {
    if (usedIndices.has(i)) continue;
    // 첫 번째 미사용 줄이 짧으면 거래처명
    if (lines[i].length <= 20 && !foundSeparator) {
      result.store_name = lines[i];
      usedIndices.add(i);
      break;
    } else if (!foundSeparator) {
      result.store_name = lines[i];
      usedIndices.add(i);
      break;
    }
  }

  // 6차: 남은 줄들 → 구분자 이전이면 거래처명 보완, 이후면 증상
  if (descLines.length === 0) {
    // 구분자가 없으면 나머지 미사용 줄을 증상으로
    for (let i = 0; i < lines.length; i++) {
      if (!usedIndices.has(i)) {
        descLines.push(lines[i]);
      }
    }
  }

  result.description = descLines.join('\n');

  // 제목 자동 생성: 증상 첫 줄에서 30자 이내
  if (descLines.length > 0) {
    const firstLine = descLines[0];
    result.title = firstLine.length > 30 ? firstLine.slice(0, 30) + '...' : firstLine;
  }

  return result;
}
