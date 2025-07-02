import { useState } from 'react'
import { Dayjs } from 'dayjs'
import AttendanceListModal from './AttendanceListModal'
import { type ClassData } from '../utils/dataManager'

interface AdminAttendanceTableProps {
  currentMonth: Dayjs
  attendanceData: Record<string, number>
  createdClasses: ClassData[]
  onDateClickForCreate: (date: Dayjs) => void
}

const AdminAttendanceTable = ({ 
  currentMonth, 
  attendanceData, 
  createdClasses,
  onDateClickForCreate 
}: AdminAttendanceTableProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      calendar.push({
        date: currentDate,
        isCurrentMonth: currentDate.month() === currentMonth.month(),
        attendanceCount: attendanceData[dateString] || 0,
        hasClass: hasClass,
        classInfo: createdClasses.find(cls => cls.date === dateString)
      })
      currentDate = currentDate.add(1, 'day')
    }

    return calendar
  }

  // 수업이 있는 날짜 클릭 시 출석 명단 보기
  const handleAttendanceClick = (date: Dayjs) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // 수업이 없는 날짜 클릭 시 수업 생성
  const handleEmptyDateClick = (date: Dayjs) => {
    if (date.month() !== currentMonth.month()) return; // 현재 월이 아니면 무시
    onDateClickForCreate(date);
  };

  // 실제 출석 명단 가져오기
  const getActualAttendanceMembers = () => {
    // TODO: async 로직은 나중에 처리
    return []
  }

  return (
    <div>
      {/* 요일 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        marginBottom: '4px'
      }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div 
            key={day}
            style={{
              textAlign: 'center',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: '500',
              color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#6b7280'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: '#e5e7eb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {getDaysInMonth().map((day, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (day.hasClass) {
                handleAttendanceClick(day.date)
              } else {
                handleEmptyDateClick(day.date)
              }
            }}
            style={{
              minHeight: '60px',
              backgroundColor: 'white',
              padding: '8px 4px',
              cursor: day.isCurrentMonth ? 'pointer' : 'default',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.2s',
              opacity: day.isCurrentMonth ? 1 : 0.3
            }}
            onMouseOver={(e) => {
              if (day.isCurrentMonth) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }
            }}
            onMouseOut={(e) => {
              if (day.isCurrentMonth) {
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            {/* 날짜 숫자 */}
            <div style={{
              fontSize: '14px',
              fontWeight: day.hasClass ? '600' : '400',
              color: (() => {
                if (!day.isCurrentMonth) return '#d1d5db'
                if (day.hasClass) return '#1f2937'
                return '#6b7280'
              })()
            }}>
              {day.date.format('D')}
            </div>

            {/* 수업이 있는 날짜에 출석 정보 표시 */}
            {day.hasClass && day.classInfo && (
              <div style={{
                marginTop: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                flex: 1
              }}>
                {/* 수업명 */}
                <div style={{
                  fontSize: '9px',
                  color: '#1f2937',
                  fontWeight: '500',
                  lineHeight: '1.2',
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {day.classInfo.className}
                </div>

                {/* 출석 수 표시 */}
                {day.attendanceCount > 0 && (
                  <div style={{ marginTop: 'auto' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '500',
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      ✓ {day.attendanceCount}/{day.classInfo.totalStudents}명
                    </span>
                  </div>
                )}

                {/* 출석이 0명인 경우 */}
                {day.attendanceCount === 0 && (
                  <div style={{ marginTop: 'auto' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '500',
                      backgroundColor: '#fef3c7',
                      color: '#92400e'
                    }}>
                      0/{day.classInfo.totalStudents}명
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 수업이 없는 날짜에 + 아이콘 표시 */}
            {day.isCurrentMonth && !day.hasClass && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '16px',
                color: '#9ca3af',
                opacity: 0.5,
                pointerEvents: 'none'
              }}>
                +
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#6b7280',
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#9ca3af',
            borderRadius: '2px'
          }} />
          <span>수업 없음 (클릭하여 개설)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#16a34a',
            borderRadius: '2px'
          }} />
          <span>출석 있음 (클릭하여 명단 보기)</span>
        </div>
      </div>

      {/* 출석 명단 모달 */}
      {selectedDate && (
        <AttendanceListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          members={getActualAttendanceMembers()}
        />
      )}
    </div>
  )
}

export default AdminAttendanceTable 