# EduVerse 디자인 시스템 웹사이트

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 디자인 시스템 웹사이트 |
| 버전 | 1.1 |
| 최종 수정일 | 2025-10-19 |
| 기준 문서 | PRD v2.8, 역할별 기능 리스트 v3.7, 시스템 아키텍처 v1.4 |

## 📖 개요

EduVerse 디자인 시스템의 모든 컴포넌트와 스타일 가이드를 인터랙티브하게 확인할 수 있는 웹사이트입니다.

## 🚀 실행 방법

### 로컬에서 실행

1. 이 폴더를 브라우저에서 엽니다:
   ```
   index.html 파일을 더블클릭하거나 브라우저로 드래그
   ```

2. 또는 로컬 서버를 실행합니다:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (http-server)
   npx http-server
   ```

3. 브라우저에서 접속:
   ```
   http://localhost:8000
   ```

## 📋 포함된 내용

### 1. 개요
- EduVerse 디자인 철학
- 핵심 원칙 소개

### 2. 컬러 시스템
- Gray Scale 팔레트
- 브랜드 컬러 (Primary, Success, Warning, Danger)
- 상태 표시 컬러
- 클릭 시 색상 코드 복사 기능

### 3. 타이포그래피
- 폰트 크기 (xs ~ 7xl)
- 플래너 폰트 (Nanum Pen Script)
- 폰트 굵기 (Normal, Medium, Semibold, Bold)

### 4. 버튼 컴포넌트
- Primary Button (다양한 크기)
- Success Button
- Danger Button
- Secondary Button (Teal)
- Icon Buttons

### 5. 입력 필드
- Text Input
- Select
- Textarea
- Focus 상태 스타일

### 6. 카드 컴포넌트
- Basic Card
- Student Status Card (실시간 모니터링)
- Planner Widget

### 7. 모달
- 인터랙티브 모달 예제
- 오버레이 및 애니메이션

### 8. 진도바
- 다양한 진도율 표시
- 색상별 상태 표현

### 9. 토스트 알림
- Success, Error, Info 토스트
- 자동 사라짐 기능

### 10. 로딩 상태
- Loading Spinner
- Skeleton UI

### 11. 응용 예제
- 로그인 폼
- 대시보드 위젯
- 질문 카드

## 🎨 주요 기능

### 인터랙티브 기능

1. **색상 복사**: 색상 팔레트 클릭 시 클립보드에 색상 코드 복사
2. **모달 열기/닫기**: 버튼 클릭으로 모달 테스트
3. **토스트 알림**: 각 버튼 클릭으로 다양한 토스트 확인
4. **부드러운 스크롤**: 사이드바 네비게이션 클릭 시 해당 섹션으로 이동
5. **반응형 사이드바**: 모바일에서 햄버거 메뉴로 전환

### 반응형 디자인

- **Desktop (1024px+)**: 고정 사이드바
- **Tablet/Mobile (< 1024px)**: 토글 사이드바

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **TailwindCSS v3**: CDN 방식 (빠른 프로토타이핑)
- **Vanilla JavaScript**: 모달, 토스트 등 인터랙션
- **Google Fonts**: Nanum Pen Script

## 📦 구조

```
design-system/
├── index.html          # 메인 웹사이트
└── README.md           # 이 문서
```

## 🎯 사용 목적

### 개발자를 위한 레퍼런스
- 컴포넌트 HTML/CSS 코드 복사
- 실제 렌더링 결과 확인
- TailwindCSS 클래스 참고

### 디자이너/기획자를 위한 가이드
- 브랜드 컬러 확인
- 컴포넌트 스타일 검토
- 인터랙션 동작 확인

### 교육용
- 프론트엔드 학습자를 위한 예제
- 디자인 시스템 구축 사례

## 🔧 커스터마이징

### TailwindCSS 설정 수정

`index.html` 파일 내부의 `<script>` 섹션에서 Tailwind 설정을 수정할 수 있습니다:

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        'planner': ['"Nanum Pen Script"', 'cursive'],
      },
      // 여기에 커스텀 설정 추가
    }
  }
}
```

### 새로운 컴포넌트 추가

1. `<section>` 태그로 새 섹션 생성
2. 사이드바 네비게이션에 링크 추가
3. 컴포넌트 HTML 작성
4. 필요한 경우 JavaScript 함수 추가

## 📚 참고 문서

- [EduVerse 디자인 시스템 문서](../01-eduverse-design-system.md)
- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)
- [Google Fonts](https://fonts.google.com/)

## 🤝 기여 가이드

새로운 컴포넌트나 개선사항이 있다면:

1. 컴포넌트 섹션 추가
2. 코드 예제 포함
3. 인터랙티브 기능 구현 (필요 시)
4. README 업데이트

## 📝 버전 정보

- **버전**: 1.0.0
- **작성일**: 2025-10-16
- **최종 수정**: 2025-10-16
- **작성자**: Claude AI Assistant

## 💡 팁

### 코드 복사하기
각 컴포넌트 아래에 있는 코드 블록을 복사하여 바로 프로젝트에 사용할 수 있습니다.

### 색상 코드 복사하기
색상 팔레트의 사각형을 클릭하면 hex 코드가 자동으로 클립보드에 복사됩니다.

### 모바일에서 테스트하기
브라우저의 개발자 도구(F12)에서 반응형 모드로 전환하여 모바일 뷰를 확인할 수 있습니다.

## 🐛 알려진 이슈

현재 알려진 이슈가 없습니다.

## 📞 문의

디자인 시스템 관련 문의사항이 있으시면 프로젝트 관리자에게 연락해주세요.

---

**EduVerse 디자인 시스템** - 오프라인 강의실을 위한 최적화된 UI
