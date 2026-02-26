import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminEventWrite() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnailUrl: '',
        startDate: '',
        endDate: ''
    });
    const [showPreview, setShowPreview] = useState(true);

    const fetchEvent = async () => {
        try {
            const response = await adminApi.getEvent(id);
            const event = response.data;
            setFormData({
                title: event.title,
                content: event.content,
                thumbnailUrl: event.thumbnailUrl || '',
                startDate: event.startDate.substring(0, 16), // Format for datetime-local
                endDate: event.endDate.substring(0, 16)
            });
        } catch (error) {
            console.error('이벤트 불러오기 실패:', error);
            alert('이벤트를 불러오지 못했습니다.');
            navigate('/admin');
        }
    };

    useEffect(() => {
        if (isEdit) {
            fetchEvent();
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
                await adminApi.updateEvent(id, formData);
                alert('수정했습니다.');
            } else {
                await adminApi.createEvent(formData);
                alert('등록했습니다.');
            }
            navigate('/admin'); // Usually returns to management page
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
                        <div className="admin-list-title">{isEdit ? '이벤트 수정' : '이벤트 등록'}</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>썸네일, 기간, 본문을 한곳에서 관리합니다.</div>
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
                            <label className="form-label" style={{ fontWeight: 800 }}>목록용 썸네일 URL</label>
                            <input className="admin-input" id="thumbnailUrl" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="https://..." />
                            {formData.thumbnailUrl && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ color: '#6B7280', fontSize: 12 }}>썸네일 미리보기</div>
                                    <div style={{ marginTop: 8, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                                        <img src={formData.thumbnailUrl} alt="thumbnail preview" style={{ maxHeight: 120, borderRadius: 6 }} onError={(e) => e.target.src = 'https://placehold.co/200x100?text=Invalid+URL'} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="form-label" style={{ fontWeight: 800 }}>시작 일시</label>
                                <input className="admin-input" type="datetime-local" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="form-label" style={{ fontWeight: 800 }}>종료 일시</label>
                                <input className="admin-input" type="datetime-local" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label" style={{ fontWeight: 800 }}>이벤트 본문 내용 (HTML)</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" className="admin-btn-sm" onClick={() => setShowPreview((s) => !s)}>{showPreview ? '미리보기 숨기기' : '미리보기 보기'}</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <textarea className="admin-input" id="content" name="content" rows={10} value={formData.content} onChange={handleChange} placeholder="<h3>제목</h3><p>내용...</p>" style={{ flex: showPreview ? 1 : '1 1 100%', minHeight: 200 }} />

                                {showPreview && (
                                    <div style={{ flex: 1, border: '1px solid #F3F4F6', borderRadius: 8, padding: 12, background: '#fff', minHeight: 200, overflowY: 'auto' }}>
                                        <div style={{ color: '#6B7280', marginBottom: 8, fontSize: 13 }}>미리보기</div>
                                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="admin-btn-sm" onClick={() => navigate('/admin')}>취소</button>
                            <button type="submit" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>{isEdit ? '수정' : '등록'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminEventWrite;
