import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const adminMenus = [
        {
            title: '공지사항 관리',
            description: '공지사항을 등록, 수정, 삭제할 수 있습니다',
            icon: '📢',
            path: '/admin/notice',
            color: '#3b82f6'
        },
        {
            title: 'FAQ 관리',
            description: '자주 묻는 질문을 관리할 수 있습니다',
            icon: '❓',
            path: '/admin/faq',
            color: '#8b5cf6'
        },
        {
            title: '상품 등록',
            description: '새로운 상품을 등록할 수 있습니다',
            icon: '🛍️',
            path: '/admin/add-product',
            color: '#10b981'
        },
        {
            title: '회원 관리',
            description: '회원 정보를 조회하고 관리합니다',
            icon: '👥',
            path: '/admin/users',
            color: '#f59e0b'
        },
        {
            title: '마켓 관리',
            description: '등록된 상품을 관리합니다',
            icon: '🏪',
            path: '/admin/market',
            color: '#ec4899'
        },
        {
            title: '클래스 관리',
            description: '클래스를 등록하고 관리합니다',
            icon: '👨‍🍳',
            path: '/admin/classes',
            color: '#06b6d4'
        },
        {
            title: '예약 관리',
            description: '클래스 예약 현황을 확인합니다',
            icon: '📅',
            path: '/admin/reservations',
            color: '#84cc16'
        },
        {
            title: '결제 관리',
            description: '결제 내역을 조회하고 관리합니다',
            icon: '💳',
            path: '/admin/payments',
            color: '#f97316'
        },
        {
            title: '문의 관리',
            description: '고객 문의를 확인하고 답변합니다',
            icon: '💬',
            path: '/admin/inquiries',
            color: '#6366f1'
        }
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-container">
                <div className="admin-header">
                    <h1 className="admin-title">관리자 대시보드</h1>
                    <p className="admin-subtitle">한스푼 관리 시스템</p>
                </div>

                <div className="admin-grid">
                    {adminMenus.map((menu, index) => (
                        <Link
                            key={index}
                            to={menu.path}
                            className="admin-card"
                            style={{ '--card-color': menu.color }}
                        >
                            <div className="admin-card-icon">{menu.icon}</div>
                            <h3 className="admin-card-title">{menu.title}</h3>
                            <p className="admin-card-description">{menu.description}</p>
                            <div className="admin-card-arrow">→</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
