// src/components/AddressSearch.jsx
// 행정안전부 도로명주소 API를 사용하는 주소 검색 컴포넌트
import { useState, useRef, useEffect } from "react";
import "./AddressSearch.css";

const JUSO_API_KEY = import.meta.env.VITE_JUSO_API_KEY;
// 도로명주소 검색 API 엔드포인트
const JUSO_API_URL = "https://www.juso.go.kr/addrlink/addrLinkApiJsonp.do";

export default function AddressSearch({ onSelect }) {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const COUNT_PER_PAGE = 10;

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const search = async (targetPage = 1) => {
        if (!keyword.trim()) return;
        setLoading(true);
        setError("");
        try {
            // JSONP 방식으로 호출 (CORS 우회)
            const data = await fetchJusoJsonp(keyword, targetPage, COUNT_PER_PAGE);
            if (data.results.common.errorCode !== "0") {
                setError(data.results.common.errorMessage || "검색 오류가 발생했습니다.");
                setResults([]);
                return;
            }
            setResults(data.results.juso || []);
            setTotalCount(Number(data.results.common.totalCount) || 0);
            setPage(targetPage);
            setIsOpen(true);
        } catch (e) {
            setError("주소 검색 중 오류가 발생했습니다.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            search(1);
        }
    };

    const handleSelect = (juso) => {
        // roadAddr: 도로명주소, bdNm: 건물명, zipNo: 우편번호
        const address = juso.roadAddr;
        onSelect({
            zipCode: juso.zipNo,
            address1: address,
            address2: "",
        });
        setIsOpen(false);
        setKeyword(juso.roadAddr);
        setResults([]);
    };

    const totalPages = Math.ceil(totalCount / COUNT_PER_PAGE);

    return (
        <div className="address-search" ref={containerRef}>
            <div className="address-search__input-row">
                <input
                    ref={inputRef}
                    className="address-search__input"
                    type="text"
                    placeholder="도로명, 건물명 또는 지번으로 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                />
                <button
                    className="address-search__btn"
                    type="button"
                    onClick={() => search(1)}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="address-search__spinner" />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                        </svg>
                    )}
                    검색
                </button>
            </div>

            {error && <div className="address-search__error">{error}</div>}

            {isOpen && results.length > 0 && (
                <div className="address-search__dropdown">
                    <div className="address-search__result-info">
                        총 <b>{totalCount.toLocaleString()}</b>건 ({page}/{totalPages}페이지)
                    </div>
                    <ul className="address-search__list">
                        {results.map((juso, i) => (
                            <li
                                key={i}
                                className="address-search__item"
                                onClick={() => handleSelect(juso)}
                            >
                                <div className="address-search__item-road">
                                    <span className="address-search__badge road">도로명</span>
                                    {juso.roadAddr}
                                </div>
                                {juso.jibunAddr && (
                                    <div className="address-search__item-jibun">
                                        <span className="address-search__badge jibun">지번</span>
                                        {juso.jibunAddr}
                                    </div>
                                )}
                                <div className="address-search__item-zip">우편번호: {juso.zipNo}</div>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div className="address-search__pagination">
                            <button
                                disabled={page <= 1}
                                onClick={() => search(page - 1)}
                            >
                                ‹ 이전
                            </button>
                            <span>{page} / {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => search(page + 1)}
                            >
                                다음 ›
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// JSONP 방식으로 주소 검색 API 호출 (CORS 우회)
function fetchJusoJsonp(keyword, currentPage, countPerPage) {
    return new Promise((resolve, reject) => {
        const callbackName = `jusoCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        const params = new URLSearchParams({
            confmKey: JUSO_API_KEY,
            currentPage: String(currentPage),
            countPerPage: String(countPerPage),
            keyword,
            resultType: "json",
        });

        // JSONP 방식: script 태그로 요청
        const script = document.createElement("script");
        script.src = `${JUSO_API_URL}?${params.toString()}&callback=${callbackName}`;

        const cleanup = () => {
            delete window[callbackName];
            document.head.removeChild(script);
        };

        window[callbackName] = (data) => {
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error("JSONP 요청 실패"));
        };

        // 10초 타임아웃
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("요청 시간이 초과되었습니다."));
        }, 10000);

        script.onload = () => clearTimeout(timeout);

        document.head.appendChild(script);
    });
}
