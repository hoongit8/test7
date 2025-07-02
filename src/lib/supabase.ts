import { createClient } from '@supabase/supabase-js'

// Supabase URL과 API Key (실제 프로젝트에서는 환경 변수 사용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 개발 모드 확인 (true면 localStorage 사용, false면 Supabase 사용)
export const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 테이블 타입 정의
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          student_id: string
          password: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          student_id: string
          password?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          student_id?: string
          password?: string | null
          active?: boolean
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          date: string
          class_name: string
          start_time: string
          end_time: string
          announcement: string | null
          attendance_count: number
          total_students: number
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          class_name: string
          start_time: string
          end_time: string
          announcement?: string | null
          attendance_count?: number
          total_students?: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          class_name?: string
          start_time?: string
          end_time?: string
          announcement?: string | null
          attendance_count?: number
          total_students?: number
          created_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          student_id: string
          student_name: string
          class_date: string
          attendance_time: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          student_name: string
          class_date: string
          attendance_time: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          student_name?: string
          class_date?: string
          attendance_time?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
} 