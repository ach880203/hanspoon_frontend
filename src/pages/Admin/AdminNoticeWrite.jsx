
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminNoticeWrite() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [showPreview, setShowPreview] = useState(true);

    const fetchNotice = async () => {
        try {
            const response = await adminApi.getNotice(id);
            const notice = response.data; // Since adminApi returns response.data (ApiResponse)
            setFormData({
                title: notice.title,
                content: notice.content
            });
        } catch (error) {
            console.error('공지사항 불러오기 실패:', error);
            alert('공지사항을 불러오지 못했습니다.');
            navigate('/admin/notice');
        }
    };

    useEffect(() => {
        if (isEdit) {
            fetchNotice();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await adminApi.updateNotice(id, formData);
                alert('수정했습니다.');
            } else {
                await adminApi.createNotice(formData);
                alert('등록했습니다.');
            }
            navigate('/admin/notice');
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장에 실패했습니다.');
        }
    };

    return (
        <div className="admin-list-container">
            <div className="admin-list-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="admin-list-title">{isEdit ? '공지사항 수정' : '공지사항 등록'}</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>간단한 공지 작성/수정 폼입니다.</div>
                    </div>
                </div>
            </div>

            <div className="admin-table-card" style={{ padding: 20 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <label className="form-label" style={{ fontWeight: 800 }}>제목</label>
                            <input className="admin-input" id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label" style={{ fontWeight: 800 }}>내용 (HTML 가능)</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" className="admin-btn-sm" onClick={() => setShowPreview((s) => !s)}>{showPreview ? '미리보기 숨기기' : '미리보기 보기'}</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <textarea className="admin-input" id="content" name="content" rows={10} value={formData.content} onChange={handleChange} required style={{ flex: showPreview ? 1 : '1 1 100%', minHeight: 220 }} />

                                {showPreview && (
                                    <div style={{ flex: 1, border: '1px solid #F3F4F6', borderRadius: 8, padding: 12, background: '#fff', minHeight: 220, overflowY: 'auto' }}>
                                        <div style={{ color: '#6B7280', marginBottom: 8, fontSize: 13 }}>미리보기</div>
                                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="admin-btn-sm" onClick={() => navigate('/admin/notice')}>취소</button>
                            <button type="submit" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>{isEdit ? '수정' : '등록'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminNoticeWrite;

