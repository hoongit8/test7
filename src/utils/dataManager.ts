// 학생과 관리자 간 데이터 공유를 위한 데이터 매니저
import { isDevelopmentMode } from '../lib/supabase'
import { supabaseDataManager } from './supabaseDataManager'

// 데이터 타입 정의
export interface Student {
  id: string;
  name: string;
  studentId: string;
  password?: string; // 비밀번호 (선택적 - 기존 학생들은 기본값 사용)
  active: boolean;
}

export interface ClassData {
  date: string;
  className: string;
  startTime: string;
  endTime: string;
  announcement?: string; // 공지사항 (선택적 필드)
  attendanceCount: number;
  totalStudents: number;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  classDate: string;
  attendanceTime: string;
  status: 'present';
}

// 로컬스토리지 키
const STORAGE_KEYS = {
  STUDENTS: 'attendance_students',
  CLASSES: 'attendance_classes',
  ATTENDANCE_RECORDS: 'attendance_records'
} as const;

// 기본 학생 데이터
const DEFAULT_STUDENTS: Student[] = [
  { id: 'S001', name: '김철수', studentId: 'S001', active: true },
  { id: 'S002', name: '박영희', studentId: 'S002', active: true },
  { id: 'S003', name: '이민수', studentId: 'S003', active: true },
  { id: 'S004', name: '정수진', studentId: 'S004', active: true },
  { id: 'S005', name: '최동욱', studentId: 'S005', active: true },
  { id: 'S006', name: '한지영', studentId: 'S006', active: true },
  { id: 'S007', name: '송민호', studentId: 'S007', active: true },
  { id: 'S008', name: '윤서연', studentId: 'S008', active: true },
  { id: 'S009', name: '강태현', studentId: 'S009', active: true },
  { id: 'S010', name: '조은비', studentId: 'S010', active: true }
];

// 현재 날짜 기준으로 테스트용 기본 수업 데이터 생성
const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 테스트용 기본 수업 데이터 (현재 날짜 기준)
const DEFAULT_CLASSES: ClassData[] = [
  {
    date: getYesterdayDateString(), // 어제 (출석체크 가능)
    className: 'React 기초반',
    startTime: '09:00',
    endTime: '18:00',
    announcement: '실습 위주의 수업입니다. 노트북을 준비해 주세요.',
    attendanceCount: 0,
    totalStudents: 10
  },
  {
    date: getCurrentDateString(), // 오늘 (출석체크 가능)
    className: '웹개발 심화과정',
    startTime: '10:00',
    endTime: '17:00',
    announcement: '프로젝트 발표가 있습니다. 준비해 오세요.',
    attendanceCount: 0,
    totalStudents: 10
  },
  {
    date: getTomorrowDateString(), // 내일 (관리자가 생성한 수업 예시)
    className: 'TypeScript 마스터',
    startTime: '14:00',
    endTime: '18:00',
    announcement: '최신 TypeScript 5.0 기능을 다룹니다.',
    attendanceCount: 0,
    totalStudents: 10
  }
];

class DataManager {
  // 학생 관리
  getStudents(): Student[] {
    const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!stored) {
      this.setStudents(DEFAULT_STUDENTS);
      return DEFAULT_STUDENTS;
    }
    return JSON.parse(stored);
  }

  setStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  getActiveStudentsCount(): number {
    return this.getStudents().filter(student => student.active).length;
  }

  // 학생 로그인 검증
  validateStudentLogin(studentId: string, password: string): Student | null {
    const students = this.getStudents();
    const student = students.find(s => s.studentId === studentId && s.active);
    
    if (!student) {
      return null; // 학생을 찾을 수 없음
    }

    // 기존 학생들(password 필드가 없는 경우)은 기본 비밀번호 '1234' 사용
    const studentPassword = student.password || '1234';
    
    if (studentPassword === password) {
      return student;
    }
    
    return null; // 비밀번호 불일치
  }

  // 수업 관리
  getClasses(): ClassData[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!stored) {
      this.setClasses(DEFAULT_CLASSES);
      return DEFAULT_CLASSES;
    }
    return JSON.parse(stored);
  }

  setClasses(classes: ClassData[]): void {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  addClass(newClass: Omit<ClassData, 'attendanceCount' | 'totalStudents'>): boolean {
    const classes = this.getClasses();
    const existingClass = classes.find(cls => cls.date === newClass.date);
    
    if (existingClass) {
      return false; // 이미 존재하는 날짜
    }

    const classWithDefaults: ClassData = {
      ...newClass,
      attendanceCount: 0,
      totalStudents: this.getActiveStudentsCount()
    };

    classes.push(classWithDefaults);
    this.setClasses(classes);
    return true;
  }

  getClassByDate(date: string): ClassData | null {
    const classes = this.getClasses();
    return classes.find(cls => cls.date === date) || null;
  }

  // 출석 기록 관리
  getAttendanceRecords(): AttendanceRecord[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS);
    return stored ? JSON.parse(stored) : [];
  }

  setAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(records));
  }

  // 학생 출석 체크
  addAttendanceRecord(studentId: string, classDate: string): boolean {
    // 해당 날짜에 수업이 있는지 확인
    const classInfo = this.getClassByDate(classDate);
    if (!classInfo) {
      return false; // 수업이 없는 날짜
    }

    const records = this.getAttendanceRecords();
    const student = this.getStudents().find(s => s.id === studentId);
    
    if (!student) {
      return false; // 학생이 존재하지 않음
    }

    // 이미 출석한 기록이 있는지 확인
    const existingRecord = records.find(
      record => record.studentId === studentId && record.classDate === classDate
    );

    if (existingRecord) {
      return false; // 이미 출석함
    }

    // 새 출석 기록 추가
    const newRecord: AttendanceRecord = {
      studentId,
      studentName: student.name,
      classDate,
      attendanceTime: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'present'
    };

    records.push(newRecord);
    this.setAttendanceRecords(records);

    // 수업의 출석 카운트 업데이트
    this.updateClassAttendanceCount(classDate);
    return true;
  }

  // 학생 출석 취소
  removeAttendanceRecord(studentId: string, classDate: string): boolean {
    const records = this.getAttendanceRecords();
    const recordIndex = records.findIndex(
      record => record.studentId === studentId && record.classDate === classDate
    );

    if (recordIndex === -1) {
      return false; // 출석 기록이 없음
    }

    records.splice(recordIndex, 1);
    this.setAttendanceRecords(records);

    // 수업의 출석 카운트 업데이트
    this.updateClassAttendanceCount(classDate);
    return true;
  }

  // 수업별 출석 카운트 업데이트
  updateClassAttendanceCount(classDate: string): void {
    const classes = this.getClasses();
    const records = this.getAttendanceRecords();
    
    const classIndex = classes.findIndex(cls => cls.date === classDate);
    if (classIndex !== -1) {
      const attendanceCount = records.filter(record => record.classDate === classDate).length;
      classes[classIndex].attendanceCount = attendanceCount;
      this.setClasses(classes);
    }
  }

  // 학생별 출석 기록 조회
  getStudentAttendanceRecords(studentId: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords();
    return records.filter(record => record.studentId === studentId);
  }

  // 특정 날짜의 출석 명단 조회
  getAttendanceByDate(date: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords();
    return records.filter(record => record.classDate === date);
  }

  // 데이터 초기화 (개발/테스트용)
  resetData(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_RECORDS);
  }

  // 학생 인증 정보 관리
  setStudentAuth(studentId: string, studentName: string): void {
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('studentName', studentName);
    localStorage.setItem('studentToken', 'authenticated');
  }

  getStudentAuth(): { studentId: string; studentName: string } | null {
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');
    const token = localStorage.getItem('studentToken');

    if (!studentId || !studentName || !token) {
      return null;
    }

    return { studentId, studentName };
  }

  clearStudentAuth(): void {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentToken');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
// 로컬 데이터 매니저 인스턴스
const localDataManager = new DataManager()

// 하이브리드 데이터 매니저 (개발 모드에 따라 localStorage 또는 Supabase 사용)
class HybridDataManager {
  // 학생 관리
  async getStudents(): Promise<Student[]> {
    if (isDevelopmentMode) {
      return localDataManager.getStudents()
    }
    return await supabaseDataManager.getStudents()
  }

  async setStudents(students: Student[]): Promise<void> {
    if (isDevelopmentMode) {
      localDataManager.setStudents(students)
    } else {
      // Supabase에서는 개별 학생 추가/수정으로 처리
      console.warn('Supabase 모드에서는 setStudents 대신 addStudent를 사용하세요')
    }
  }

  async addStudent(student: Omit<Student, 'id'>): Promise<boolean> {
    if (isDevelopmentMode) {
      const students = localDataManager.getStudents()
      const newStudent = {
        ...student,
        id: `S${String(students.length + 1).padStart(3, '0')}`
      }
      const updatedStudents = [...students, newStudent]
      localDataManager.setStudents(updatedStudents)
      return true
    }
    return await supabaseDataManager.addStudent(student)
  }

  async getActiveStudentsCount(): Promise<number> {
    if (isDevelopmentMode) {
      return localDataManager.getActiveStudentsCount()
    }
    return await supabaseDataManager.getActiveStudentsCount()
  }

  async validateStudentLogin(studentId: string, password: string): Promise<Student | null> {
    if (isDevelopmentMode) {
      return localDataManager.validateStudentLogin(studentId, password)
    }
    return await supabaseDataManager.validateStudentLogin(studentId, password)
  }

  // 수업 관리
  async getClasses(): Promise<ClassData[]> {
    if (isDevelopmentMode) {
      return localDataManager.getClasses()
    }
    return await supabaseDataManager.getClasses()
  }

  async setClasses(classes: ClassData[]): Promise<void> {
    if (isDevelopmentMode) {
      localDataManager.setClasses(classes)
    } else {
      console.warn('Supabase 모드에서는 setClasses 대신 addClass를 사용하세요')
    }
  }

  async addClass(newClass: Omit<ClassData, 'attendanceCount' | 'totalStudents'>): Promise<boolean> {
    if (isDevelopmentMode) {
      return localDataManager.addClass(newClass)
    }
    return await supabaseDataManager.addClass(newClass)
  }

  async getClassByDate(date: string): Promise<ClassData | null> {
    if (isDevelopmentMode) {
      return localDataManager.getClassByDate(date)
    }
    return await supabaseDataManager.getClassByDate(date)
  }

  // 출석 기록 관리
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (isDevelopmentMode) {
      return localDataManager.getAttendanceRecords()
    }
    return await supabaseDataManager.getAttendanceRecords()
  }

  async setAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
    if (isDevelopmentMode) {
      localDataManager.setAttendanceRecords(records)
    } else {
      console.warn('Supabase 모드에서는 setAttendanceRecords 대신 addAttendanceRecord를 사용하세요')
    }
  }

  async addAttendanceRecord(studentId: string, classDate: string): Promise<boolean> {
    if (isDevelopmentMode) {
      return localDataManager.addAttendanceRecord(studentId, classDate)
    }
    return await supabaseDataManager.addAttendanceRecord(studentId, classDate)
  }

  async removeAttendanceRecord(studentId: string, classDate: string): Promise<boolean> {
    if (isDevelopmentMode) {
      return localDataManager.removeAttendanceRecord(studentId, classDate)
    } else {
      // Supabase에서 출석 기록 삭제 기능은 필요에 따라 구현
      console.warn('Supabase 모드에서는 출석 기록 삭제 기능이 구현되지 않았습니다')
      return false
    }
  }

  async updateClassAttendanceCount(classDate: string): Promise<void> {
    if (isDevelopmentMode) {
      localDataManager.updateClassAttendanceCount(classDate)
    } else {
      await supabaseDataManager.updateClassAttendanceCount(classDate)
    }
  }

  async getStudentAttendanceRecords(studentId: string): Promise<AttendanceRecord[]> {
    if (isDevelopmentMode) {
      return localDataManager.getStudentAttendanceRecords(studentId)
    }
    return await supabaseDataManager.getStudentAttendanceRecords(studentId)
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    if (isDevelopmentMode) {
      return localDataManager.getAttendanceByDate(date)
    }
    return await supabaseDataManager.getAttendanceByDate(date)
  }

  // 인증 관리
  setStudentAuth(studentId: string, studentName: string): void {
    if (isDevelopmentMode) {
      localDataManager.setStudentAuth(studentId, studentName)
    } else {
      supabaseDataManager.setStudentAuth(studentId, studentName)
    }
  }

  getStudentAuth(): { studentId: string; studentName: string } | null {
    if (isDevelopmentMode) {
      return localDataManager.getStudentAuth()
    }
    return supabaseDataManager.getStudentAuth()
  }

  clearStudentAuth(): void {
    if (isDevelopmentMode) {
      localDataManager.clearStudentAuth()
    } else {
      supabaseDataManager.clearStudentAuth()
    }
  }

  // 데이터 초기화 (개발용)
  resetData(): void {
    if (isDevelopmentMode) {
      localDataManager.resetData()
    } else {
      console.warn('Supabase 모드에서는 데이터 초기화를 할 수 없습니다')
    }
  }
}

export const dataManager = new HybridDataManager(); 