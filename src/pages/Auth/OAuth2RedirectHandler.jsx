import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveAuth } from '../../utils/authStorage';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');

        if (token) {
            // 앱의 인증 스토리지 규격에 맞게 저장 {accessToken, tokenType}
            saveAuth({ accessToken: token, tokenType: 'Bearer' });

            // 로그인 성공 후 메인 페이지로 이동 및 새로고침 (Header 등의 상태 업데이트를 위함)
            window.location.href = '/';
        } else {
            const error = getUrlParameter('error');
            alert(error || '로그인 중 오류가 발생했습니다.');
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
                <h2>로그인 처리 중...</h2>
                <p>잠시만 기다려 주세요.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
