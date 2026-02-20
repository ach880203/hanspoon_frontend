import React, { useState } from 'react';
import AdminUserList from './AdminUserList';
import AdminPaymentList from './AdminPaymentList';
import { OneDayHome } from '../OneDay/OneDayHome'; // 예시로 OneDay 메인 연결
import AdminDashboardPage from './AdminDashboardPage';
import AdminNoticeList from './AdminNoticeList';
import AdminFaqList from './AdminFaqList';
import PlaceholderPage from '../PlaceholderPage';
import { AdminReservationList } from './AdminReservationList';
import './AdminList.css';

const AdminManagementPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboardPage />;
            case 'users':
                return <AdminUserList />;
            case 'payments':
                return <AdminPaymentList />;
            case 'classes':
                return <OneDayHome />;
            case 'market':
                return <PlaceholderPage title="마켓 관리 (상품 목록)" />;
            case 'reservations':
                return <AdminReservationList />;
            case 'cs':
                return (
                    <div className="admin-cs-container">
                        <h3>공지사항 관리</h3>
                        <AdminNoticeList />
                        <hr style={{ margin: '40px 0' }} />
                        <h3>FAQ 관리</h3>
                        <AdminFaqList />
                        <hr style={{ margin: '40px 0' }} />
                        <h3>1:1 문의 관리</h3>
                        <PlaceholderPage title="1:1 문의 목록" />
                    </div>
                );
            default:
                return <AdminDashboardPage />;
        }
    };

    return (
        <div className="admin-management-container">
            <div className="admin-tabs-nav" style={{ flexWrap: 'wrap' }}>
                <button
                    className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    대시보드
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    회원 관리
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    결제 관리
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('classes')}
                >
                    클래스 관리
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'market' ? 'active' : ''}`}
                    onClick={() => setActiveTab('market')}
                >
                    상품 관리
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reservations')}
                >
                    예약 관리
                </button>
                <button
                    className={`admin-tab-btn ${activeTab === 'cs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cs')}
                >
                    게시판/CS
                </button>
            </div>

            <div className="admin-tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminManagementPage;
