import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { dataManager, type Student, type AttendanceRecord } from '../utils/dataManager';

interface AttendanceStats {
  totalCount: number;
  monthlyCount: number;
}

type SortType = '많은순' | '적은순' | null;

const AdminMembers = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<Student | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [sortType, setSortType] = useState<SortType>(null);
  const [members, setMembers] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      const studentsData = await dataManager.getStudents();
      const attendanceData = await dataManager.getAttendanceRecords();
      
      setMembers(studentsData);
      setAttendanceRecords(attendanceData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  };

  // 출석 통계 계산 (실제 데이터 기반)
  const getAttendanceStats = (member: Student): AttendanceStats => {
    const memberRecords = attendanceRecords.filter(record => record.studentId === member.id);
    const currentMonth = dayjs();
    
    return {
      totalCount: memberRecords.length,
      monthlyCount: memberRecords.filter(record => 
        dayjs(record.classDate).isSame(currentMonth, 'month')
      ).length
    };
  };

  // 정렬된 회원 목록
  const sortedMembers = useMemo(() => {
    if (!sortType) return members.filter(m => m.active);

    return [...members]
      .filter(m => m.active)
      .sort((a, b) => {
        const aCount = getAttendanceStats(a).monthlyCount;
        const bCount = getAttendanceStats(b).monthlyCount;
        return sortType === '많은순' ? bCount - aCount : aCount - bCount;
      });
  }, [members, attendanceRecords, sortType]);

  const handleMemberClick = (member: Student) => {
    setSelectedMember(member);
    setShowStats(true);
  };

  const handleSortClick = (type: SortType) => {
    setSortType(type === sortType ? null : type);
  };

  // 데이터 새로고침
  const refreshData = () => {
    loadData();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '430px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              title="대시보드로 돌아가기"
            >
              <svg style={{ width: '20px', height: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              회원 관리 👥
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={refreshData}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#16a34a',
                color: 'white'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              title="출석 현황 새로고침"
            >
              🔄
            </button>
            <button
              onClick={() => handleSortClick('많은순')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: sortType === '많은순' ? '#2563eb' : '#f3f4f6',
                color: sortType === '많은순' ? 'white' : '#6b7280'
              }}
              onMouseOver={(e) => {
                if (sortType !== '많은순') {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'
                }
              }}
              onMouseOut={(e) => {
                if (sortType !== '많은순') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }
              }}
            >
              출석 많은순
            </button>
            <button
              onClick={() => handleSortClick('적은순')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: sortType === '적은순' ? '#2563eb' : '#f3f4f6',
                color: sortType === '적은순' ? 'white' : '#6b7280'
              }}
              onMouseOver={(e) => {
                if (sortType !== '적은순') {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'
                }
              }}
              onMouseOut={(e) => {
                if (sortType !== '적은순') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }
              }}
            >
              출석 적은순
            </button>
          </div>
        </div>

        {/* 전체 통계 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                {members.filter(m => m.active).length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>활성 학생</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                {attendanceRecords.length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>총 출석</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                {attendanceRecords.filter(record => 
                  dayjs(record.classDate).isSame(dayjs(), 'month')
                ).length}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>이번달 출석</div>
            </div>
          </div>
        </div>
        
        {/* 회원 목록 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            {sortedMembers.map((member, index) => {
              const stats = getAttendanceStats(member);
              return (
                <div
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderBottom: index === sortedMembers.length - 1 ? 'none' : '1px solid #e5e7eb',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        {member.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 2px 0'
                      }}>
                        학생ID: {member.studentId}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        전체 출석: {stats.totalCount}회
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 2px 0'
                        }}>
                          이번달
                        </p>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: stats.monthlyCount > 0 ? '#16a34a' : '#2563eb',
                          margin: 0
                        }}>
                          {stats.monthlyCount}회
                        </p>
                      </div>
                      <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 출석 통계 모달 */}
        {showStats && selectedMember && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '400px'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  margin: 0
                }}>
                  {selectedMember.name} 출석 현황
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const stats = getAttendanceStats(selectedMember);
                  const memberRecords = attendanceRecords.filter(record => record.studentId === selectedMember.id);
                  
                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{
                          backgroundColor: '#eff6ff',
                          padding: '16px',
                          borderRadius: '8px'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#2563eb',
                            margin: '0 0 4px 0'
                          }}>
                            전체 출석
                          </p>
                          <p style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1d4ed8',
                            margin: 0
                          }}>
                            {stats.totalCount}회
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: '#f0fdf4',
                          padding: '16px',
                          borderRadius: '8px'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#059669',
                            margin: '0 0 4px 0'
                          }}>
                            이번달 출석
                          </p>
                          <p style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#047857',
                            margin: 0
                          }}>
                            {stats.monthlyCount}회
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        backgroundColor: '#f9fafb',
                        padding: '16px',
                        borderRadius: '8px'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 4px 0'
                        }}>
                          학생 ID
                        </p>
                        <p style={{
                          fontSize: '16px',
                          color: '#374151',
                          margin: 0
                        }}>
                          {selectedMember.studentId}
                        </p>
                      </div>

                      {/* 최근 출석 기록 */}
                      {memberRecords.length > 0 && (
                        <div>
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#111827',
                            margin: '0 0 8px 0'
                          }}>
                            최근 출석 기록 (최근 5개)
                          </h3>
                          <div style={{
                            maxHeight: '120px',
                            overflowY: 'auto',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            padding: '8px'
                          }}>
                            {memberRecords
                              .sort((a, b) => dayjs(b.classDate).valueOf() - dayjs(a.classDate).valueOf())
                              .slice(0, 5)
                              .map((record, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 0',
                                    borderBottom: index < 4 && index < memberRecords.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}
                                >
                                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {dayjs(record.classDate).format('MM/DD')}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#16a34a' }}>
                                    {record.attendanceTime}
                                  </span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              
              <div style={{
                padding: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => setShowStats(false)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembers; 