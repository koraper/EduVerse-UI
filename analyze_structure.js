const fs = require('fs');

// JSONC 파일 읽기 (주석 제거)
const content = fs.readFileSync('./scenario-latest.jsonc', 'utf-8');
const lines = content.split('\n')
  .filter(line => !line.trim().startsWith('//'))
  .join('\n');

const data = JSON.parse(lines);

console.log('=== 커리큘럼 구조 분석 ===\n');
console.log('커리큘럼명:', data.courseTitle);
console.log('총 주차 수:', data.weeks.length);
console.log('\n=== 주차별 상세 정보 ===\n');

let totalCycles = 0;

data.weeks.forEach((week) => {
  console.log(`Week ${week.week}: ${week.title}`);
  console.log(`  - 사이클 수: ${week.cycles.length}개`);
  totalCycles += week.cycles.length;

  week.cycles.forEach((cycle, idx) => {
    console.log(`    [${idx + 1}] ${cycle.title}`);

    // 각 사이클의 키 확인
    const hasBasic = {
      starterCode: !!cycle.starterCode,
      testCode: !!cycle.testCode,
      task: !!cycle.task,
      briefing: !!cycle.briefing,
      feedback: !!cycle.feedback
    };

    const hasAdvanced = {
      starterCode_adv: !!cycle.starterCode_adv,
      testCode_adv: !!cycle.testCode_adv,
      task_adv: !!cycle.task_adv,
      briefing_adv: !!cycle.briefing_adv,
      feedback_adv: !!cycle.feedback_adv
    };

    const hasLecture = !!cycle.lecture;

    // 누락된 키 찾기
    const missingBasic = Object.entries(hasBasic).filter(([k, v]) => !v).map(([k]) => k);
    const missingAdvanced = Object.entries(hasAdvanced).filter(([k, v]) => !v).map(([k]) => k);

    if (missingBasic.length > 0 || missingAdvanced.length > 0 || !hasLecture) {
      console.log(`        [경고] 누락된 키:`);
      if (missingBasic.length > 0) console.log(`          초급자: ${missingBasic.join(', ')}`);
      if (missingAdvanced.length > 0) console.log(`          경험자: ${missingAdvanced.join(', ')}`);
      if (!hasLecture) console.log(`          공통: lecture`);
    }
  });

  console.log('');
});

console.log(`총 사이클 수: ${totalCycles}개`);

console.log('\n=== 키 구조 요약 ===');
console.log('공통 필수 키:');
console.log('  - title (과제 제목)');
console.log('  - syntax_key (문법 키)');
console.log('  - filename (파일명)');
console.log('  - lecture (교수 강의 노트)');
console.log('');
console.log('초급자 키 (난이도: 기본):');
console.log('  - starterCode (초급자 시작 코드)');
console.log('  - testCode (초급자 테스트 코드)');
console.log('  - task (초급자 과제 설명)');
console.log('  - briefing (초급자 브리핑)');
console.log('  - feedback (초급자 피드백: success, failure_logical, failure_runtime)');
console.log('');
console.log('경험자 키 (난이도: 고급):');
console.log('  - starterCode_adv (경험자 시작 코드)');
console.log('  - testCode_adv (경험자 테스트 코드)');
console.log('  - task_adv (경험자 과제 설명)');
console.log('  - briefing_adv (경험자 브리핑)');
console.log('  - feedback_adv (경험자 피드백: success, failure_logical, failure_runtime)');
