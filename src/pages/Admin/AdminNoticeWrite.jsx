
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api';

function AdminNoticeWrite() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

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
        <div className="container mt-5">
            <h2>{isEdit ? '공지사항 수정' : '공지사항 등록'}</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">제목</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">내용</label>
                    <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/notice')}>
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

export default AdminNoticeWrite;

