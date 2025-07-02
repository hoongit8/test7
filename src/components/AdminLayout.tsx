
import { Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4">
          <div className="max-w-[430px] mx-auto flex justify-between items-center h-12">
            <h1 className="text-base font-medium text-gray-900">관리자 페이지</h1>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-0 py-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 