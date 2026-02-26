import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveAuth } from '../../utils/authStorage';
import { authApi } from '../../api/auth';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[[]/, '\[').replace(/[\]]/, '\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const run = async () => {
            const token = getUrlParameter('token');

            if (token) {
                // 토큰 저장
                saveAuth({ accessToken: token, tokenType: 'Bearer' });

                try {
                    // 로그인 직후 사용자 정보를 받아 첫가입(포인트 지급) 여부 판단
                    const me = await authApi.me();

                    // 로컬 스토리지에 사용자 정보(포인트 포함)를 동기화
                    saveAuth({
                        accessToken: token,
                        tokenType: 'Bearer',
                        userId: me?.userId ?? null,
                        email: me?.email ?? null,
                        userName: me?.userName ?? null,
                        spoonBalance: me?.spoonBalance ?? 0,
                        role: me?.role ?? null,
                    });

                    const isFirst = me?.spoonBalance === 3000;
                    if (isFirst) {
                        navigate('/', { state: { showWelcomeModal: true } });
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    // 실패 시 포괄적인 처리: 루트로 이동
                    window.location.href = '/';
                }
            } else {
                const error = getUrlParameter('error');
                alert(error || '로그인 중 오류가 발생했습니다.');
                navigate('/login');
            }
        };

        run();
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
