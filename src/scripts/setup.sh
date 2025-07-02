#!/bin/bash

# 학생 출석 체크 애플리케이션 설정 스크립트

echo "🚀 학생 출석 체크 애플리케이션 설정을 시작합니다..."

# 환경 변수 파일 생성
if [ ! -f .env ]; then
    echo "📝 환경 변수 파일을 생성합니다..."
    cat > .env << EOL
# Supabase 설정
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 개발 모드 (true: localStorage 사용, false: Supabase 사용)
VITE_DEV_MODE=true
EOL
    echo "✅ .env 파일이 생성되었습니다. Supabase 정보를 입력해 주세요."
else
    echo "ℹ️ .env 파일이 이미 존재합니다."
fi

# 의존성 설치
echo "📦 의존성을 설치합니다..."
npm install

# 프로젝트 빌드 테스트
echo "🔨 프로젝트 빌드를 테스트합니다..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드가 성공적으로 완료되었습니다!"
    echo ""
    echo "📋 다음 단계:"
    echo "1. .env 파일에 실제 Supabase 정보를 입력하세요"
    echo "2. Supabase에서 database/supabase_setup.sql을 실행하세요"
    echo "3. 배포를 위해 Git 리포지토리에 푸시하세요"
    echo ""
    echo "🌐 배포 옵션:"
    echo "- Vercel: npm run deploy:vercel"
    echo "- Netlify: npm run deploy:netlify"
    echo "- 수동 배포: dist 폴더를 웹 서버에 업로드"
else
    echo "❌ 빌드에 실패했습니다. 오류를 확인해 주세요."
fi 