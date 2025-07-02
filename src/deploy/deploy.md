# 학생 출석 체크 애플리케이션 배포 가이드

## 1단계: Supabase 프로젝트 설정

### 1.1 Supabase 계정 생성 및 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. "New Project" 클릭하여 새 프로젝트 생성
3. 프로젝트 이름: `student-attendance-app`
4. 데이터베이스 비밀번호 설정 (안전한 비밀번호 사용)

### 1.2 데이터베이스 테이블 생성
1. Supabase 대시보드에서 "SQL Editor" 선택
2. `database/supabase_setup.sql` 파일의 내용을 복사하여 실행
3. "Run" 버튼 클릭하여 테이블 및 초기 데이터 생성

### 1.3 API 키 확인
1. Supabase 대시보드의 "Settings" > "API" 이동
2. 다음 정보 복사:
   - Project URL: `https://your-project-ref.supabase.co`
   - anon public key: `your-anon-key`

## 2단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
# Supabase 설정
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 프로덕션 모드 (false: Supabase 사용)
VITE_DEV_MODE=false
```

**중요**: 실제 값으로 `your-project-ref`와 `your-anon-key`를 교체하세요.

## 3단계: 웹 호스팅 배포

### 옵션 1: Vercel 배포 (추천)

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com)에 접속하여 GitHub 계정으로 로그인

2. **GitHub 연동**
   - 프로젝트를 GitHub 리포지토리에 푸시
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/student-attendance-app.git
   git push -u origin main
   ```

3. **Vercel에서 배포**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 리포지토리 선택
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 "Environment Variables" 추가
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
   - `VITE_DEV_MODE`: `false`

### 옵션 2: Netlify 배포

1. **Netlify 계정 생성**
   - [Netlify](https://netlify.com)에 접속하여 계정 생성

2. **사이트 배포**
   - "New site from Git" 선택
   - GitHub 리포지토리 연결
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **환경 변수 설정**
   - Site settings > Environment variables에서 설정
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
   - `VITE_DEV_MODE`: `false`

### 옵션 3: 수동 빌드 후 정적 호스팅

1. **프로젝트 빌드**
   ```bash
   npm run build
   ```

2. **빌드 파일 배포**
   - `dist` 폴더의 내용을 웹 서버에 업로드
   - 지원 호스팅: GitHub Pages, AWS S3, Firebase Hosting 등

## 4단계: 도메인 연결 (선택사항)

### 커스텀 도메인 설정
1. 도메인 구매 (예: GoDaddy, Namecheap)
2. Vercel/Netlify에서 도메인 연결
3. DNS 설정 업데이트

## 5단계: 애플리케이션 테스트

### 배포 후 확인사항
1. **관리자 로그인 테스트**
   - URL: `https://your-domain.com/admin/login`
   - 계정: admin / 1234

2. **학생 로그인 테스트**
   - URL: `https://your-domain.com/student/login`
   - 기존 학생: S001~S010 / 1234
   - 신규 가입 테스트

3. **기능 테스트**
   - 수업 개설 (관리자)
   - 출석 체크 (학생)
   - 데이터 연동 확인

## 6단계: 성능 최적화

### PWA 설정 (선택사항)
```bash
npm install vite-plugin-pwa
```

### 캐싱 설정
- Vercel/Netlify에서 자동 CDN 및 캐싱 제공

## 7단계: 보안 설정

### Supabase Row Level Security (RLS) 강화
1. Supabase 대시보드에서 RLS 정책 세밀 조정
2. 관리자 인증 시스템 강화 (선택사항)
3. HTTPS 강제 사용

## 트러블슈팅

### 일반적인 문제 해결

1. **환경 변수 오류**
   - Vercel/Netlify에서 환경 변수 재확인
   - 변수명이 `VITE_`로 시작하는지 확인

2. **Supabase 연결 오류**
   - Project URL과 API Key 재확인
   - Supabase 프로젝트가 활성화되었는지 확인

3. **빌드 오류**
   - `npm install` 후 `npm run build` 재시도
   - Node.js 버전 확인 (16+ 권장)

## 운영 관리

### 데이터 백업
- Supabase 대시보드에서 정기적인 데이터 백업 설정

### 모니터링
- Vercel/Netlify Analytics 활용
- Supabase 사용량 모니터링

### 업데이트
- GitHub 푸시 시 자동 배포
- 새로운 기능 추가 시 단계적 배포 