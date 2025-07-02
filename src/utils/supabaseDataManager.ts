// Supabase를 사용하는 데이터 매니저
import { supabase } from '../lib/supabase'
import type { Student, ClassData, AttendanceRecord } from './dataManager'

class SupabaseDataManager {
  // 학생 관리
  async getStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('학생 목록 조회 오류:', error)
        return []
      }

      // Supabase 데이터를 애플리케이션 타입으로 변환
      return data.map(student => ({
        id: student.id,
        name: student.name,
        studentId: student.student_id,
        password: student.password,
        active: student.active
      }))
    } catch (error) {
      console.error('학생 목록 조회 실패:', error)
      return []
    }
  }

  async addStudent(student: Omit<Student, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('students')
        .insert({
          name: student.name,
          student_id: student.studentId,
          password: student.password,
          active: student.active
        })

      if (error) {
        console.error('학생 추가 오류:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('학생 추가 실패:', error)
      return false
    }
  }

  async validateStudentLogin(studentId: string, password: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      // 기존 학생들(password가 null인 경우)은 기본 비밀번호 '1234' 사용
      const studentPassword = data.password || '1234'
      
      if (studentPassword === password) {
        return {
          id: data.id,
          name: data.name,
          studentId: data.student_id,
          password: data.password,
          active: data.active
        }
      }

      return null
    } catch (error) {
      console.error('로그인 검증 실패:', error)
      return null
    }
  }

  async getActiveStudentsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      if (error) {
        console.error('활성 학생 수 조회 오류:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('활성 학생 수 조회 실패:', error)
      return 0
    }
  }

  // 수업 관리
  async getClasses(): Promise<ClassData[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('수업 목록 조회 오류:', error)
        return []
      }

      // Supabase 데이터를 애플리케이션 타입으로 변환
      return data.map(cls => ({
        date: cls.date,
        className: cls.class_name,
        startTime: cls.start_time,
        endTime: cls.end_time,
        announcement: cls.announcement,
        attendanceCount: cls.attendance_count,
        totalStudents: cls.total_students
      }))
    } catch (error) {
      console.error('수업 목록 조회 실패:', error)
      return []
    }
  }

  async addClass(newClass: Omit<ClassData, 'attendanceCount' | 'totalStudents'>): Promise<boolean> {
    try {
      // 중복 날짜 확인
      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('date', newClass.date)
        .single()

      if (existingClass) {
        return false // 이미 존재하는 날짜
      }

      // 활성 학생 수 조회
      const totalStudents = await this.getActiveStudentsCount()

      const { error } = await supabase
        .from('classes')
        .insert({
          date: newClass.date,
          class_name: newClass.className,
          start_time: newClass.startTime,
          end_time: newClass.endTime,
          announcement: newClass.announcement,
          attendance_count: 0,
          total_students: totalStudents
        })

      if (error) {
        console.error('수업 추가 오류:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('수업 추가 실패:', error)
      return false
    }
  }

  async getClassByDate(date: string): Promise<ClassData | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('date', date)
        .single()

      if (error || !data) {
        return null
      }

      return {
        date: data.date,
        className: data.class_name,
        startTime: data.start_time,
        endTime: data.end_time,
        announcement: data.announcement,
        attendanceCount: data.attendance_count,
        totalStudents: data.total_students
      }
    } catch (error) {
      console.error('수업 조회 실패:', error)
      return null
    }
  }

  // 출석 기록 관리
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('출석 기록 조회 오류:', error)
        return []
      }

      return data.map(record => ({
        studentId: record.student_id,
        studentName: record.student_name,
        classDate: record.class_date,
        attendanceTime: record.attendance_time,
        status: record.status as 'present'
      }))
    } catch (error) {
      console.error('출석 기록 조회 실패:', error)
      return []
    }
  }

  async addAttendanceRecord(studentId: string, classDate: string): Promise<boolean> {
    try {
      // 해당 날짜에 수업이 있는지 확인
      const classInfo = await this.getClassByDate(classDate)
      if (!classInfo) {
        return false // 수업이 없는 날짜
      }

      // 학생 정보 조회
      const students = await this.getStudents()
      const student = students.find(s => s.id === studentId)
      
      if (!student) {
        return false // 학생이 존재하지 않음
      }

      // 이미 출석한 기록이 있는지 확인
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_date', classDate)
        .single()

      if (existingRecord) {
        return false // 이미 출석함
      }

      // 새 출석 기록 추가
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          student_id: studentId,
          student_name: student.name,
          class_date: classDate,
          attendance_time: new Date().toLocaleTimeString('ko-KR', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          status: 'present'
        })

      if (error) {
        console.error('출석 기록 추가 오류:', error)
        return false
      }

      // 수업의 출석 카운트 업데이트
      await this.updateClassAttendanceCount(classDate)
      
      return true
    } catch (error) {
      console.error('출석 기록 추가 실패:', error)
      return false
    }
  }

  async updateClassAttendanceCount(classDate: string): Promise<void> {
    try {
      // 해당 날짜의 출석 기록 수 조회
      const { count, error } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('class_date', classDate)

      if (error) {
        console.error('출석 카운트 조회 오류:', error)
        return
      }

      // 수업의 출석 카운트 업데이트
      const { error: updateError } = await supabase
        .from('classes')
        .update({ attendance_count: count || 0 })
        .eq('date', classDate)

      if (updateError) {
        console.error('출석 카운트 업데이트 오류:', updateError)
      }
    } catch (error) {
      console.error('출석 카운트 업데이트 실패:', error)
    }
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_date', date)
        .order('attendance_time', { ascending: true })

      if (error) {
        console.error('날짜별 출석 기록 조회 오류:', error)
        return []
      }

      return data.map(record => ({
        studentId: record.student_id,
        studentName: record.student_name,
        classDate: record.class_date,
        attendanceTime: record.attendance_time,
        status: record.status as 'present'
      }))
    } catch (error) {
      console.error('날짜별 출석 기록 조회 실패:', error)
      return []
    }
  }

  async getStudentAttendanceRecords(studentId: string): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('class_date', { ascending: false })

      if (error) {
        console.error('학생별 출석 기록 조회 오류:', error)
        return []
      }

      return data.map(record => ({
        studentId: record.student_id,
        studentName: record.student_name,
        classDate: record.class_date,
        attendanceTime: record.attendance_time,
        status: record.status as 'present'
      }))
    } catch (error) {
      console.error('학생별 출석 기록 조회 실패:', error)
      return []
    }
  }

  // 인증 관리 (localStorage 사용 - 세션 관리)
  setStudentAuth(studentId: string, studentName: string): void {
    localStorage.setItem('student_auth', JSON.stringify({ studentId, studentName }))
  }

  getStudentAuth(): { studentId: string; studentName: string } | null {
    try {
      const stored = localStorage.getItem('student_auth')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  clearStudentAuth(): void {
    localStorage.removeItem('student_auth')
  }
}

export const supabaseDataManager = new SupabaseDataManager() 