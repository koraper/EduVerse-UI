# Components

React 재사용 가능한 컴포넌트들을 관리하는 디렉토리입니다.

## 디렉토리 구조

```
components/
├── common/          # 공통 컴포넌트 (Button, Input, Modal 등)
├── auth/            # 인증 관련 컴포넌트
├── student/         # 학생 전용 컴포넌트
├── professor/       # 교수자 전용 컴포넌트
├── admin/           # 관리자 전용 컴포넌트
└── layout/          # 레이아웃 컴포넌트 (Header, Sidebar, Footer)
```

## 네이밍 규칙

- 컴포넌트 파일: PascalCase (예: `Button.tsx`, `UserCard.tsx`)
- 스타일 파일: 컴포넌트명.module.css (선택적)
- 테스트 파일: 컴포넌트명.test.tsx

## 공통 컴포넌트 (common)

### 사용 가능한 컴포넌트

EduVerse에서 사용 가능한 공통 컴포넌트들입니다.

#### 1. Button
버튼 컴포넌트 - 다양한 variant, size, loading 상태 지원

```typescript
import { Button } from '@/components/common'

// 기본 사용
<Button onClick={handleClick}>클릭</Button>

// Variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Size
<Button size="sm">작은 버튼</Button>
<Button size="md">중간 버튼</Button>
<Button size="lg">큰 버튼</Button>

// Loading 상태
<Button loading>로딩 중...</Button>

// 아이콘과 함께
<Button leftIcon={<Icon />}>왼쪽 아이콘</Button>
<Button rightIcon={<Icon />}>오른쪽 아이콘</Button>

// 전체 너비
<Button fullWidth>전체 너비 버튼</Button>
```

#### 2. Input
입력 필드 컴포넌트 - label, error, helper text 지원

```typescript
import { Input } from '@/components/common'

// 기본 사용
<Input placeholder="이메일을 입력하세요" />

// Label과 함께
<Input
  label="이메일"
  placeholder="example@email.com"
/>

// Error 상태
<Input
  label="비밀번호"
  error="비밀번호는 8자 이상이어야 합니다"
/>

// Helper text
<Input
  label="사용자명"
  helperText="영문, 숫자 조합 4-20자"
/>

// 아이콘과 함께
<Input
  leftIcon={<EmailIcon />}
  placeholder="이메일"
/>

// Size
<Input size="sm" placeholder="작은 입력" />
<Input size="md" placeholder="중간 입력" />
<Input size="lg" placeholder="큰 입력" />
```

#### 3. Textarea
텍스트 영역 컴포넌트

```typescript
import { Textarea } from '@/components/common'

<Textarea
  label="질문 내용"
  placeholder="질문을 입력하세요"
  rows={4}
/>

// Resize 비활성화
<Textarea resize={false} />
```

#### 4. Select
선택 박스 컴포넌트

```typescript
import { Select } from '@/components/common'

const options = [
  { value: '1', label: '옵션 1' },
  { value: '2', label: '옵션 2' },
  { value: '3', label: '옵션 3', disabled: true },
]

<Select
  label="학년"
  options={options}
  placeholder="학년을 선택하세요"
/>
```

#### 5. Modal
모달 컴포넌트 - Portal을 사용하여 body에 렌더링

```typescript
import { Modal, Button } from '@/components/common'
import { useState } from 'react'

const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>모달 열기</Button>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="제목"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>취소</Button>
      <Button onClick={handleSubmit}>확인</Button>
    </>
  }
>
  모달 내용
</Modal>

// Size 옵션
<Modal size="sm">작은 모달</Modal>
<Modal size="md">중간 모달</Modal>
<Modal size="lg">큰 모달</Modal>
<Modal size="xl">매우 큰 모달</Modal>
<Modal size="full">전체 화면 모달</Modal>

// 옵션
<Modal
  closeOnBackdropClick={false}  // 배경 클릭시 닫기 비활성화
  closeOnEsc={false}             // ESC 키로 닫기 비활성화
  showCloseButton={false}        // X 버튼 숨기기
>
  내용
</Modal>
```

#### 6. Card
카드 컴포넌트

```typescript
import { Card } from '@/components/common'

<Card
  title="카드 제목"
  subtitle="부제목"
  footer={<Button fullWidth>버튼</Button>}
>
  카드 내용
</Card>

// Padding 옵션
<Card padding="none">패딩 없음</Card>
<Card padding="sm">작은 패딩</Card>
<Card padding="md">중간 패딩</Card>
<Card padding="lg">큰 패딩</Card>

// Hoverable
<Card hoverable onClick={handleClick}>
  클릭 가능한 카드
</Card>
```

#### 7. Badge
배지 컴포넌트

```typescript
import { Badge } from '@/components/common'

// Variant
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>

// Size
<Badge size="sm">작음</Badge>
<Badge size="md">중간</Badge>
<Badge size="lg">큼</Badge>

// Pill 모양
<Badge pill>Pill</Badge>

// Dot과 함께
<Badge dot>온라인</Badge>
```

#### 8. Spinner
로딩 스피너 컴포넌트

```typescript
import { Spinner } from '@/components/common'

// Size
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />

// 색상 지정
<Spinner color="text-red-500" />
```

#### 9. Loading
로딩 화면 컴포넌트

```typescript
import { Loading } from '@/components/common'

// 인라인 로딩
<Loading text="로딩 중..." />

// 전체 화면 로딩
<Loading fullScreen text="데이터를 불러오는 중..." size="xl" />
```

## 사용 예시

```typescript
import { Button, Input, Modal, Card, Badge } from '@/components/common'
import { useState } from 'react'

function Example() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <Card title="로그인" padding="lg">
      <div className="space-y-4">
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />

        <Button
          fullWidth
          onClick={() => setIsModalOpen(true)}
        >
          로그인
        </Button>

        <Badge variant="success" dot>온라인</Badge>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="알림"
      >
        로그인 처리 중...
      </Modal>
    </Card>
  )
}
```
