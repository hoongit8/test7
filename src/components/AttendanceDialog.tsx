import { Dayjs } from 'dayjs'

interface AttendanceDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  date: Dayjs | null
  isCancel?: boolean
}

const AttendanceDialog = ({ isOpen, onClose, onConfirm, date, isCancel }: AttendanceDialogProps) => {
  if (!isOpen || !date) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 py-6">
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {isCancel ? '출석 취소' : '출석 확인'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {date.format('YYYY년 MM월 DD일')}
          {isCancel ? '의 출석을 취소하시겠습니까?' : '에 출석하시겠습니까?'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 bg-gray-50 rounded-xl text-sm font-medium hover:bg-gray-100 active:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-white rounded-xl text-sm font-medium ${
              isCancel 
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {isCancel ? '출석 취소' : '확인'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceDialog 