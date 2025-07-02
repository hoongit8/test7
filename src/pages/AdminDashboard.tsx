import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AdminAttendanceTable from '../components/AdminAttendanceTable'
import ClassCreateModal from '../components/ClassCreateModal'
import { dataManager, type Student, type ClassData } from '../utils/dataManager'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [isClassCreateModalOpen, setIsClassCreateModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [createdClasses, setCreatedClasses] = useState<ClassData[]>([])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      const studentsData = await dataManager.getStudents()
      const classesData = await dataManager.getClasses()
      
      setStudents(studentsData)
      setCreatedClasses(classesData)
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    }
  }

  // 활성 학생 수 계산
  const totalActiveStudents = students.filter(student => student.active).length

  // 개설된 수업 날짜만 출석 데이터로 변환
  const getAttendanceData = () => {
    const attendanceData: Record<string, number> = {}
    createdClasses.forEach(classData => {
      attendanceData[classData.date] = classData.attendanceCount
    })
    return attendanceData
  }

  // 수업 생성 핸들러
  const handleCreateClass = async (date: string, className: string, startTime: string, endTime: string, announcement?: string) => {
    try {
      const success = await dataManager.addClass({
        date,
        className,
        startTime,
        endTime,
        announcement
      })
      
      if (success) {
        // 데이터 새로고침
        await loadData()
        alert(`${dayjs(date).format('MM월 DD일')} "${className}" 수업이 개설되었습니다!\n출석 가능 학생: ${totalActiveStudents}명`)
      } else {
        alert('이미 해당 날짜에 수업이 개설되어 있습니다.')
      }
    } catch (error) {
      console.error('수업 생성 오류:', error)
      alert('수업 생성 중 오류가 발생했습니다.')
    }
  }

  // 날짜 클릭 핸들러 (수업 생성을 위한)
  const handleDateClickForCreate = (date: dayjs.Dayjs) => {
    // 과거 날짜는 수업 생성 불가
    if (date.isBefore(dayjs(), 'day')) {
      alert('과거 날짜에는 수업을 개설할 수 없습니다.')
      return
    }

    setSelectedDate(date)
    setIsClassCreateModalOpen(true)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'))
  }

  const handleCurrentMonth = () => {
    setCurrentMonth(dayjs())
  }

  // 출석 데이터 새로고침 (출석 현황 변경 시 실시간 업데이트용)
  const refreshData = () => {
    loadData()
  }

  const attendanceData = getAttendanceData()

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ 
        maxWidth: '430px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* 상단 버튼 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: 0
          }}>
            수업 관리 📚
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={refreshData}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              title="출석 현황 새로고침"
            >
              🔄
            </button>
            <button
              onClick={() => navigate('/admin/members')}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              회원관리
            </button>
          </div>
        </div>

        {/* 전체 학생 수 정보 */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#0c4a6e',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            👥 현재 활성 학생: <strong>{totalActiveStudents}명</strong> | 수업 개설 시 이 학생들이 출석체크 가능합니다
          </p>
        </div>

        {/* 안내 메시지 */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#1e40af',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 달력의 날짜를 클릭하여 새로운 수업을 개설할 수 있습니다
          </p>
        </div>

        {/* 달력 네비게이션 */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#111827',
            margin: 0
          }}>
            {currentMonth.format('YYYY년 MM월')}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                padding: '4px 10px',
                fontSize: '14px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              이전
            </button>
            <button
              onClick={handleCurrentMonth}
              style={{
                padding: '4px 10px',
                fontSize: '14px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              이번달
            </button>
            <button
              onClick={handleNextMonth}
              style={{
                padding: '4px 10px',
                fontSize: '14px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다음
            </button>
          </div>
        </div>

        {/* 출석 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px'
        }}>
          <AdminAttendanceTable
            currentMonth={currentMonth}
            attendanceData={attendanceData}
            createdClasses={createdClasses}
            onDateClickForCreate={handleDateClickForCreate}
          />
        </div>

        {/* 수업 목록 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            개설된 수업 목록
          </h4>
          {createdClasses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {createdClasses
                .filter(cls => dayjs(cls.date).month() === currentMonth.month())
                .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
                .map((cls, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {cls.className}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {dayjs(cls.date).format('MM월 DD일 (dddd)')} | {cls.startTime} - {cls.endTime}
                    </div>
                    {cls.announcement && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#059669',
                        backgroundColor: '#ecfdf5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        border: '1px solid #d1fae5'
                      }}>
                        📢 {cls.announcement}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{
                      fontSize: '12px',
                      backgroundColor: cls.attendanceCount > 0 ? '#dcfce7' : '#dbeafe',
                      color: cls.attendanceCount > 0 ? '#166534' : '#1e40af',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {cls.attendanceCount}/{cls.totalStudents}명
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280'
                    }}>
                      출석률: {cls.totalStudents > 0 ? Math.round((cls.attendanceCount / cls.totalStudents) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              padding: '20px 0',
              margin: 0
            }}>
              이번 달에 개설된 수업이 없습니다.
            </p>
          )}
        </div>

        {/* 통계 요약 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            이번 달 통계
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                {createdClasses.filter(cls => dayjs(cls.date).month() === currentMonth.month()).length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>개설 수업</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                {createdClasses
                  .filter(cls => dayjs(cls.date).month() === currentMonth.month())
                  .reduce((sum, cls) => sum + cls.attendanceCount, 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>총 출석</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                {(() => {
                  const monthClasses = createdClasses.filter(cls => dayjs(cls.date).month() === currentMonth.month())
                  if (monthClasses.length === 0) return 0
                  
                  const totalAttendanceRate = monthClasses.reduce((sum, cls) => {
                    return sum + (cls.totalStudents > 0 ? (cls.attendanceCount / cls.totalStudents * 100) : 0)
                  }, 0)
                  
                  return Math.round(totalAttendanceRate / monthClasses.length)
                })()}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>평균 출석률</div>
            </div>
          </div>
        </div>

        {/* 실시간 현황 */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #16a34a',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#166534',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔄 실시간 연동: 학생들이 출석체크하면 자동으로 반영됩니다 (새로고침 버튼 클릭)
          </p>
        </div>
      </div>

      {/* 수업 생성 모달 */}
      {selectedDate && (
        <ClassCreateModal
          isOpen={isClassCreateModalOpen}
          onClose={() => {
            setIsClassCreateModalOpen(false)
            setSelectedDate(null)
          }}
          date={selectedDate}
          onCreateClass={handleCreateClass}
        />
      )}
    </div>
  )
}

export default AdminDashboard 
