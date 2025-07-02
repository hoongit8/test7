import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataManager, type Student } from '../utils/dataManager'

const StudentLogin = () => {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // 회원가입 관련 상태
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [signupForm, setSignupForm] = useState({
    studentId: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [signupError, setSignupError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 새로운 비밀번호 검증 함수 사용
      const student = await dataManager.validateStudentLogin(studentId, password)
      
      if (student) {
        dataManager.setStudentAuth(student.id, student.name)
        navigate('/student/attendance')
      } else {
        setError('학생 ID가 올바르지 않거나 비밀번호가 틀렸습니다.')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다.')
    }
  }

  // 회원가입 처리 함수
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')

    try {
      // 입력값 검증
      if (!signupForm.studentId.trim() || !signupForm.name.trim() || !signupForm.password || !signupForm.confirmPassword) {
        setSignupError('모든 필드를 입력해 주세요.')
        return
      }

      if (signupForm.password !== signupForm.confirmPassword) {
        setSignupError('비밀번호가 일치하지 않습니다.')
        return
      }

      if (signupForm.password.length < 4) {
        setSignupError('비밀번호는 최소 4자리 이상이어야 합니다.')
        return
      }

      // 학생 ID 중복 확인
      const students = await dataManager.getStudents()
      const existingStudent = students.find(s => s.studentId === signupForm.studentId.trim())
      
      if (existingStudent) {
        setSignupError('이미 존재하는 학생 ID입니다.')
        return
      }

      // 새로운 학생 추가
      const newStudent = {
        name: signupForm.name.trim(),
        studentId: signupForm.studentId.trim(),
        password: signupForm.password, // 사용자가 설정한 비밀번호 저장
        active: true
      }

      const success = await dataManager.addStudent(newStudent)

      if (success) {
        // 회원가입 성공 메시지 및 모달 닫기
        alert(`회원가입이 완료되었습니다!\n학생 ID: ${newStudent.studentId}\n이름: ${newStudent.name}\n\n로그인 해주세요.`)
        
        // 폼 초기화 및 모달 닫기
        setSignupForm({
          studentId: '',
          name: '',
          password: '',
          confirmPassword: ''
        })
        setSignupError('')
        setIsSignupModalOpen(false)

        // 로그인 폼에 새로 가입한 학생 ID 자동 입력
        setStudentId(newStudent.studentId)
        
        // 학생 목록 새로고침
        const updatedStudents = await dataManager.getStudents()
        setStudents(updatedStudents)
      } else {
        setSignupError('회원가입 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      setSignupError('회원가입 중 오류가 발생했습니다.')
    }
  }

  // 회원가입 모달 닫기
  const closeSignupModal = () => {
    setSignupForm({
      studentId: '',
      name: '',
      password: '',
      confirmPassword: ''
    })
    setSignupError('')
    setIsSignupModalOpen(false)
  }

  // 테스트용 학생 목록 상태
  const [students, setStudents] = useState<Student[]>([])

  // 컴포넌트 마운트 시 학생 목록 로드
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const studentsData = await dataManager.getStudents()
        setStudents(studentsData)
      } catch (error) {
        console.error('학생 목록 로드 오류:', error)
      }
    }
    loadStudents()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            학생 로그인 📚
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            학생 ID로 로그인하여 출석체크를 진행하세요
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '14px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="studentId" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                학생 ID
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="예: S001"
                required
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="1234"
                required
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              로그인
            </button>

            {/* 회원가입 버튼 */}
            <button
              type="button"
              onClick={() => setIsSignupModalOpen(true)}
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              회원가입 👤
            </button>
          </form>
        </div>

        {/* 테스트용 학생 목록 */}
        <div style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '16px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            테스트용 학생 계정 📋
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0 0 12px 0'
          }}>
            기존 학생들의 비밀번호: 1234 | 신규 가입자는 설정한 비밀번호 사용
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {students.filter(s => s.active).map((student) => (
              <div
                key={student.id}
                onClick={() => setStudentId(student.studentId)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: '12px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                <div style={{ fontWeight: '500', color: '#111827' }}>{student.studentId}</div>
                <div style={{ color: '#6b7280' }}>{student.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 회원가입 모달 */}
      {isSignupModalOpen && (
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
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* 모달 헤더 */}
            <div style={{
              padding: '20px 20px 16px 20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  👤 회원가입
                </h2>
                <button
                  onClick={closeSignupModal}
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
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '8px 0 0 0'
              }}>
                새로운 학생으로 가입하세요
              </p>
            </div>

            {/* 모달 내용 */}
            <form onSubmit={handleSignup}>
              <div style={{ padding: '20px' }}>
                {/* 에러 메시지 */}
                {signupError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#dc2626',
                      margin: 0
                    }}>
                      {signupError}
                    </p>
                  </div>
                )}

                {/* 학생 ID 입력 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    학생 ID *
                  </label>
                  <input
                    type="text"
                    value={signupForm.studentId}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="예: S011, 2024001"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* 이름 입력 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="본명을 입력해 주세요"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* 비밀번호 입력 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="최소 4자리 이상"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* 비밀번호 확인 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    비밀번호 확인 *
                  </label>
                  <input
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="비밀번호를 다시 입력해 주세요"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* 모달 푸터 */}
              <div style={{
                padding: '16px 20px 20px 20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={closeSignupModal}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                  가입하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentLogin 