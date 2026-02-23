
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api';

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
            console.error('FAQ 불러오기 실패:', error);
            alert('FAQ를 불러오는데 실패했습니다.');
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
        setFormData(prev => ({
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
        <div className="container mt-5">
            <h2>{isEdit ? 'FAQ 수정' : 'FAQ 등록'}</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">카테고리</label>
                    <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">선택하세요</option>
                        <option value="PAYMENT">결제</option>
                        <option value="CLASS">클래스</option>
                        <option value="MEMBER">회원</option>
                        <option value="ETC">기타</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="question" className="form-label">질문</label>
                    <input
                        type="text"
                        className="form-control"
                        id="question"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="answer" className="form-label">답변</label>
                    <textarea
                        className="form-control"
                        id="answer"
                        name="answer"
                        rows="5"
                        value={formData.answer}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/faq')}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {isEdit ? '수정' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminFaqWrite;
