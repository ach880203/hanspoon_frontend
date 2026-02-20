import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { translateUserStatus } from '../../utils/statusConverter';
import './AdminList.css';

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('createdAt,desc');

    useEffect(() => {
        fetchUsers();
    }, [page, sort]);

    const fetchUsers = async () => {
        try {
            const [sortField, sortDir] = sort.split(',');
            const response = await adminApi.getUsers({
                page,
                size: 10,
                search,
                sort: `${sortField},${sortDir}`
            });
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('회원 목록 불러오기 실패:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchUsers();
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'badge-active';
            case 'SUSPENDED': return 'badge-suspended';
            case 'DELETED': return 'badge-deleted';
            default: return '';
        }
    };

    return (
        <div className="admin-list-container">
            <div className="admin-list-header">
                <h2 className="admin-list-title">회원 관리</h2>
            </div>

            {/* 검색 및 정렬 컨트롤 */}
            <div className="admin-list-controls">
                <div className="admin-control-grid">
                    <form onSubmit={handleSearch} className="admin-search-box">
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="이름 또는 이메일 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="admin-btn-search">검색</button>
                    </form>

                    <select
                        className="admin-select"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="createdAt,desc">가입일 최신순</option>
                        <option value="createdAt,asc">가입일 오래된순</option>
                        <option value="lastLoginAt,desc">최근 로그인순</option>
                        <option value="userName,asc">이름 가나다순</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>권한</th>
                            <th>상태</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td><strong>{user.userName}</strong></td>
                                <td>{user.email}</td>
                                <td>{user.role === 'ROLE_ADMIN' ? '관리자' : '일반'}</td>
                                <td>
                                    <span className={`admin-badge ${getStatusBadgeClass(user.status || (user.isDeleted ? 'DELETED' : 'ACTIVE'))}`}>
                                        {translateUserStatus(user.status || (user.isDeleted ? 'DELETED' : 'ACTIVE'))}
                                    </span>
                                </td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                                <td>
                                    <Link to={`/admin/users/${user.userId}`} className="admin-btn-sm">
                                        상세보기
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <button
                    className="admin-page-btn"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    &lt;
                </button>
                <span className="admin-page-info">
                    {page + 1} / {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    className="admin-page-btn"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}

export default AdminUserList;
