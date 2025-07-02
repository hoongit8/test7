-- 학생 출석 체크 애플리케이션을 위한 Supabase 데이터베이스 설정

-- 1. 학생 테이블
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255), -- 기존 학생들은 null (기본값 1234 사용)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 수업 테이블
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE, -- 하루에 하나의 수업만 가능
    class_name VARCHAR(200) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    announcement TEXT, -- 공지사항
    attendance_count INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 출석 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    class_date DATE NOT NULL REFERENCES classes(date) ON DELETE CASCADE,
    attendance_time VARCHAR(20) NOT NULL, -- HH:MM:SS 형식
    status VARCHAR(20) DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, class_date) -- 학생은 하루에 한 번만 출석 가능
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(active);
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance_records(created_at);

-- 기본 학생 데이터 삽입 (기존 S001~S010)
INSERT INTO students (name, student_id, password, active) VALUES
('김철수', 'S001', null, true),
('박영희', 'S002', null, true),
('이민수', 'S003', null, true),
('정수진', 'S004', null, true),
('최동욱', 'S005', null, true),
('한지영', 'S006', null, true),
('송민호', 'S007', null, true),
('윤서연', 'S008', null, true),
('강태현', 'S009', null, true),
('조은비', 'S010', null, true)
ON CONFLICT (student_id) DO NOTHING; -- 이미 존재하면 스킵

-- Row Level Security (RLS) 설정
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정 (실제 운영에서는 더 세밀한 권한 설정 필요)
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON students FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON classes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON classes FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON attendance_records FOR UPDATE USING (true);

-- 출석 카운트 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_class_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
    -- 수업의 출석 카운트 업데이트
    UPDATE classes 
    SET attendance_count = (
        SELECT COUNT(*) 
        FROM attendance_records 
        WHERE class_date = COALESCE(NEW.class_date, OLD.class_date)
    )
    WHERE date = COALESCE(NEW.class_date, OLD.class_date);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 출석 기록 추가/삭제 시 출석 카운트 자동 업데이트 트리거
CREATE TRIGGER trigger_update_attendance_count
    AFTER INSERT OR DELETE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_class_attendance_count();

-- 현재 날짜 기준 테스트 수업 데이터 추가 (선택사항)
-- 실제 운영에서는 이 부분을 제거하거나 수정하세요
DO $$
DECLARE
    yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
    today_date DATE := CURRENT_DATE;
    tomorrow_date DATE := CURRENT_DATE + INTERVAL '1 day';
BEGIN
    INSERT INTO classes (date, class_name, start_time, end_time, announcement, total_students) VALUES
    (yesterday_date, 'React 기초반', '09:00', '18:00', '실습 위주의 수업입니다. 노트북을 준비해 주세요.', 10),
    (today_date, '웹개발 심화과정', '10:00', '17:00', '프로젝트 발표가 있습니다. 준비해 오세요.', 10),
    (tomorrow_date, 'TypeScript 마스터', '14:00', '18:00', '최신 TypeScript 5.0 기능을 다룹니다.', 10)
    ON CONFLICT (date) DO NOTHING; -- 이미 존재하면 스킵
END $$; 