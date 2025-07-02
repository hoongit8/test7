import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs, { Dayjs } from 'dayjs'
import { dataManager, type AttendanceRecord } from '../utils/dataManager'

// 전역 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

const StudentAttendance = () => {
  const navigate = useNavigate()
  
  // 학생 인증 확인
  const authData = dataManager.getStudentAuth()
  const studentId = authData?.studentId || ''
  const studentName = authData?.studentName || ''

  // 상태 관리
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs())
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [createdClasses, setCreatedClasses] = useState<any[]>([]) // 개설된 수업 목록
  const [debugMode] = useState(false)

  const today = dayjs()

  // 인증 확인 후 리다이렉트
  useEffect(() => {
    if (!authData) {
      navigate('/student/login')
      return
    }

    // 학생의 출석 기록 및 수업 목록 로드
    loadAttendanceRecords(authData.studentId)
    loadCreatedClasses()
  }, [navigate])

  // 학생의 출석 기록 로드
  const loadAttendanceRecords = async (studentId: string) => {
    try {
      const records = await dataManager.getStudentAttendanceRecords(studentId)
      setAttendanceRecords(records)
      if (debugMode) {
        console.log('📋 출석 기록:', records)
      }
    } catch (error) {
      console.error('출석 기록 로드 오류:', error)
    }
  }

  // 개설된 수업 목록 로드
  const loadCreatedClasses = async () => {
    try {
      const classes = await dataManager.getClasses()
      setCreatedClasses(classes)
      if (debugMode) {
        console.log('📚 개설된 수업:', classes)
      }
    } catch (error) {
      console.error('수업 목록 로드 오류:', error)
    }
  }

  // 달력에 표시할 날짜들 생성 (간단 버전)
  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDate = startOfMonth.startOf('week')
    const endDate = endOfMonth.endOf('week')
    
    const calendar = []
    let currentDate = startDate

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const dateString = currentDate.format('YYYY-MM-DD')
      const hasClass = createdClasses.some(cls => cls.date === dateString)
      const classInfo = createdClasses.find(cls => cls.date === dateString)
      
      calendar.push({
        date: currentDate,
        isCurrentMonth: currentDate.month() === currentMonth.month(),
        isToday: currentDate.isSame(today, 'day'),
        isPast: currentDate.isBefore(today, 'day'),
        hasClass: hasClass, // 수업이 개설된 날짜인지 확인
        classInfo: classInfo || null,
        isAttended: attendanceRecords.some(record => 
          dayjs(record.classDate).isSame(currentDate, 'day')
        )
      })
      currentDate = currentDate.add(1, 'day')
    }

    return calendar
  }

  // 이전/다음 달로 이동
  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => prev.add(delta, 'month'))
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Dayjs, hasClass: boolean) => {
    if (date.month() !== currentMonth.month()) return // 현재 월이 아닌 날짜 클릭 불가
    if (!hasClass) return // 수업이 없는 날짜는 클릭 불가
    
    setSelectedDate(date)
    
    // 이미 출석한 날짜인 경우 취소 다이얼로그 표시
    if (attendanceRecords.some(record => dayjs(record.classDate).isSame(date, 'day'))) {
      setShowCancelDialog(true)
    } else {
      setShowDialog(true)
    }
  }

  // 출석 확인
  const handleAttendanceConfirm = async () => {
    if (!selectedDate || !studentId) return

    const dateString = selectedDate.format('YYYY-MM-DD')
    const success = await dataManager.addAttendanceRecord(studentId, dateString)
    
    if (success) {
      // 출석 기록 및 수업 정보 업데이트
      await loadAttendanceRecords(studentId)
      await loadCreatedClasses()
      alert(`${selectedDate.format('MM월 DD일')} 출석이 완료되었습니다!`)
    } else {
      alert('출석 처리 중 오류가 발생했습니다.')
    }
    
    setShowDialog(false)
    setSelectedDate(null)
  }

  // 출석 취소 핸들러
  const handleAttendanceCancel = async () => {
    if (!selectedDate || !studentId) return

    const dateString = selectedDate.format('YYYY-MM-DD')
    const success = await dataManager.removeAttendanceRecord(studentId, dateString)
    
    if (success) {
      // 출석 기록 및 수업 정보 업데이트
      await loadAttendanceRecords(studentId)
      await loadCreatedClasses()
      alert(`${selectedDate.format('MM월 DD일')} 출석이 취소되었습니다.`)
    } else {
      alert('출석 취소 중 오류가 발생했습니다.')
    }
    
    setShowCancelDialog(false)
    setSelectedDate(null)
  }

  // 현재 월의 출석 횟수 계산
  const getCurrentMonthAttendance = () => {
    return attendanceRecords.filter(record => 
      dayjs(record.classDate).isSame(currentMonth, 'month')
    ).length
  }

  // 로그아웃 핸들러
  const handleLogout = () => {
    dataManager.clearStudentAuth()
    navigate('/student/login')
  }

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '16px'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0',
            color: '#1f2937'
          }}>📅 출석 체크</h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>안녕하세요, {studentName}님!</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 출석 통계 */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 12px 0',
          color: '#1f2937'
        }}>📊 출석 통계</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0369a1'
            }}>{getCurrentMonthAttendance()}회</div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>이번 달</div>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#166534'
            }}>{attendanceRecords.length}회</div>
            <div style={{
              fontSize: '12px',
              color: '#64748b'
            }}>전체</div>
          </div>
        </div>
      </div>

      {/* 달력 네비게이션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <button
          onClick={() => changeMonth(-1)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ◀
        </button>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0',
          color: '#1f2937'
        }}>
          {currentMonth.format('YYYY년 M월')}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ▶
        </button>
      </div>

      {/* 달력 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        {/* 요일 헤더 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: '#f8fafc'
        }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                padding: '12px 0',
                fontSize: '12px',
                fontWeight: '600',
                color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#374151'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 달력 날짜들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#f3f4f6'
        }}>
          {getDaysInMonth().map((day, idx) => (
            <div
              key={idx}
              onClick={() => handleDateClick(day.date, day.hasClass)}
              style={{
                minHeight: '48px',
                backgroundColor: 'white',
                padding: '8px 4px',
                cursor: day.isCurrentMonth && day.hasClass ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                opacity: day.isCurrentMonth ? 1 : 0.3
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: day.isToday ? '700' : '400',
                color: (() => {
                  if (!day.isCurrentMonth) return '#d1d5db'
                  if (!day.hasClass && day.isCurrentMonth) return '#9ca3af' // 수업 없는 날은 회색
                  if (day.isToday) return '#1f2937'
                  if (day.isAttended) return '#16a34a'
                  return '#374151'
                })(),
                marginBottom: day.isAttended ? '2px' : '0'
              }}>
                {day.date.format('D')}
              </div>
              
              {/* 수업 있는 날 표시 및 출석 상태 */}
              {day.hasClass && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginTop: '2px'
                }}>
                  {/* 수업 있음 표시 */}
                  <div style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: day.isAttended ? '#16a34a' : '#3b82f6',
                    borderRadius: '50%'
                  }} />
                  {/* 출석 완료 체크 */}
                  {day.isAttended && (
                    <div style={{
                      fontSize: '8px',
                      color: '#16a34a'
                    }}>✓</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 출석 다이얼로그 */}
      {showDialog && selectedDate && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '320px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#1f2937'
            }}>출석 확인</h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {selectedDate.format('MM월 DD일')}에 출석하시겠습니까?
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleAttendanceConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                출석
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 출석 취소 다이얼로그 */}
      {showCancelDialog && selectedDate && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '320px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#1f2937'
            }}>출석 취소</h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {selectedDate.format('MM월 DD일')} 출석을 취소하시겠습니까?
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowCancelDialog(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
              <button
                onClick={handleAttendanceCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentAttendance 