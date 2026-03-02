import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api';
import './AdminList.css';

function AdminFaqWrite() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        category: '',
        question: '',
        answer: ''
    });

    const fetchFaq = async () => {
        try {
            const response = await adminApi.getFaq(id);
            const faq = response.data; // ApiResponse.data is FaqDto
            setFormData({
                category: faq.category,
                question: faq.question,
                answer: faq.answer
            });
        } catch (error) {
            console.error('자주 묻는 질문 불러오기 실패:', error);
            alert('자주 묻는 질문을 불러오는데 실패했습니다.');
            navigate('/admin/faq');
        }
    };

    useEffect(() => {
        if (isEdit) {
            fetchFaq();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await adminApi.updateFaq(id, formData);
                alert('수정되었습니다.');
            } else {
                await adminApi.createFaq(formData);
                alert('등록되었습니다.');
            }
            navigate('/admin/faq');
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
                        <div className="admin-list-title">{isEdit ? '자주 묻는 질문 수정' : '자주 묻는 질문 등록'}</div>
                        <div style={{ color: '#6B7280', marginTop: 6 }}>카테고리와 질문/답변을 입력하세요.</div>
                    </div>
                </div>
            </div>

            <div className="admin-table-card" style={{ padding: 20 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <label className="form-label" style={{ fontWeight: 800 }}>카테고리</label>
                            <select className="admin-select" id="category" name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">선택해 주세요</option>
                                <option value="쿠킹클래스">쿠킹클래스</option>
                                <option value="주문/배송">주문/배송</option>
                                <option value="결제/환불">결제/환불</option>
                                <option value="레시피">레시피</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontWeight: 800 }}>질문</label>
                            <input className="admin-input" type="text" id="question" name="question" value={formData.question} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="form-label" style={{ fontWeight: 800 }}>답변</label>
                            <textarea className="admin-input" id="answer" name="answer" rows={6} value={formData.answer} onChange={handleChange} required />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="admin-btn-sm" onClick={() => navigate('/admin/faq')}>취소</button>
                            <button type="submit" className="admin-btn-sm" style={{ background: '#FF7E36', color: '#fff', border: 'none' }}>{isEdit ? '수정' : '등록'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminFaqWrite;
