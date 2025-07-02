import React from 'react';
import dayjs from 'dayjs';

interface Member {
  id: number;
  name: string;
  attendanceTime: string;
}

interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: dayjs.Dayjs;
  members: Member[];
}

const AttendanceListModal: React.FC<AttendanceListModalProps> = ({
  isOpen,
  onClose,
  date,
  members
}) => {
  if (!isOpen) return null;

  return (
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
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* 모달 헤더 */}
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
            {date.format('YYYY년 MM월 DD일')} 출석 명단
          </h2>
          <button
            onClick={onClose}
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
        
        {/* 모달 내용 */}
        <div style={{ padding: '16px' }}>
          {members.length > 0 ? (
            <div>
              {members.map((member, index) => (
                <div key={member.id}>
                  {index > 0 && <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '12px 0' }} />}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0'
                  }}>
                    <span style={{ color: '#111827', fontSize: '14px' }}>{member.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{member.attendanceTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              출석한 회원이 없습니다.
            </div>
          )}
        </div>
        
        {/* 모달 푸터 */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
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
  );
};

export default AttendanceListModal; 