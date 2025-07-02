# 학생 출석 체크 애플리케이션 📚

React + TypeScript + Vite로 구축된 모바일 최적화 학생 출석 관리 시스템입니다.

## 🌟 주요 기능

### 관리자 기능
- 수업 개설 및 관리
- 학생 명단 관리
- 출석 현황 실시간 확인
- 월별 출석 통계
- 공지사항 작성

### 학생 기능
- 학생 로그인 및 회원가입
- 실시간 출석 체크
- 미래 수업 사전 신청
- 개인 출석 기록 확인

## 🚀 빠른 시작

### 1. 프로젝트 설정
```bash
# 프로젝트 클론
git clone https://github.com/yourusername/student-attendance-app.git
cd student-attendance-app

# 자동 설정 스크립트 실행
npm run setup
```

### 2. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 `http://localhost:5174`에서 실행됩니다.

## 🗄️ 데이터베이스 설정

### 로컬 개발 (localStorage)
기본적으로 개발 모드에서는 브라우저의 localStorage를 사용합니다.

### 프로덕션 (Supabase)
1. [Supabase](https://supabase.com)에 프로젝트 생성
2. `database/supabase_setup.sql` 실행
3. `.env` 파일에 Supabase 정보 입력:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEV_MODE=false
```

## 🌐 웹 배포

### Vercel 배포 (추천)
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
npm run deploy:vercel
```

### Netlify 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
npm run deploy:netlify
```

### 수동 배포
```bash
# 프로덕션 빌드
npm run build:prod

# dist 폴더를 웹 서버에 업로드
```

## 📱 기본 계정 정보

### 관리자
- URL: `/admin/login`
- 계정: `admin`
- 비밀번호: `1234`

### 기본 학생 계정
- URL: `/student/login`
- 계정: `S001` ~ `S010`
- 비밀번호: `1234`

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Inline Styles (모바일 최적화)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel / Netlify
- **State Management**: React Hooks
- **Date Handling**: Day.js
- **Routing**: React Router DOM

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── pages/              # 페이지 컴포넌트
├── utils/              # 유틸리티 함수
├── lib/                # 라이브러리 설정
├── hooks/              # 커스텀 훅
├── styles/             # 스타일 파일
└── types/              # TypeScript 타입 정의

database/               # 데이터베이스 스키마
deploy/                 # 배포 관련 문서
scripts/                # 자동화 스크립트
```

## 🔧 개발 가이드

### 로컬 개발 환경
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run lint

# 프로덕션 빌드
npm run build
```

### 환경 모드 전환
- **개발 모드**: `VITE_DEV_MODE=true` (localStorage 사용)
- **프로덕션 모드**: `VITE_DEV_MODE=false` (Supabase 사용)

## 📝 API 참조

### 데이터 매니저 인터페이스
```typescript
// 학생 관리
await dataManager.getStudents()
await dataManager.addStudent(student)
await dataManager.validateStudentLogin(id, password)

// 수업 관리
await dataManager.getClasses()
await dataManager.addClass(classData)
await dataManager.getClassByDate(date)

// 출석 기록
await dataManager.addAttendanceRecord(studentId, date)
await dataManager.getAttendanceRecords()
```

## 🚀 배포 가이드

자세한 배포 가이드는 [`deploy/deploy.md`](deploy/deploy.md)를 참조하세요.

## 🤝 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🐛 버그 리포트

버그나 기능 요청은 [Issues](https://github.com/yourusername/student-attendance-app/issues)에서 제보해 주세요.

## 📞 지원

- 📧 이메일: your-email@example.com
- 📚 문서: [배포 가이드](deploy/deploy.md)
- 💬 디스커션: [GitHub Discussions](https://github.com/yourusername/student-attendance-app/discussions)
