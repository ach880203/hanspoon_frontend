import { useEffect, useRef, useState } from "react";
import "./AddressSearch.css";

const JUSO_API_KEY = import.meta.env.VITE_JUSO_API_KEY;
const JUSO_API_URL = "https://www.juso.go.kr/addrlink/addrLinkApiJsonp.do";
const COUNT_PER_PAGE = 10;

export default function AddressSearch({ onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const totalPages = Math.ceil(totalCount / COUNT_PER_PAGE);

  useEffect(() => {
    // Close dropdown when user clicks outside this component.
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = async (targetPage = 1) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;
    if (!JUSO_API_KEY) {
      setError("주소 검색 키가 없습니다. `VITE_JUSO_API_KEY`를 설정해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchJusoJsonp(trimmedKeyword, targetPage, COUNT_PER_PAGE);
      const { common, juso } = data?.results ?? {};

      if (common?.errorCode !== "0") {
        setError(common?.errorMessage || "주소 검색에 실패했습니다.");
        setResults([]);
        return;
      }

      setResults(juso || []);
      setTotalCount(Number(common?.totalCount) || 0);
      setPage(targetPage);
      setIsOpen(true);
    } catch {
      setError("주소 검색에 실패했습니다. 다시 시도해 주세요.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (juso) => {
    // Normalize response shape so parent form always receives the same fields.
    onSelect?.({
      zipCode: juso.zipNo,
      address1: juso.roadAddr,
      address2: "",
    });
    setKeyword(juso.roadAddr);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="address-search" ref={containerRef}>
      <div className="address-search__input-row">
        <input
          className="address-search__input"
          type="text"
          placeholder="도로명, 건물명 또는 지번으로 검색하세요"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              search(1);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
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
            {results.map((juso, index) => (
              <li
                key={`${juso.roadAddr}-${juso.zipNo}-${index}`}
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
              <button disabled={page <= 1} onClick={() => search(page - 1)}>
                이전
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => search(page + 1)}>
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

    const script = document.createElement("script");
    script.src = `${JUSO_API_URL}?${params.toString()}&callback=${callbackName}`;

    const cleanup = () => {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    const timerId = setTimeout(() => {
      cleanup();
      reject(new Error("주소 검색 요청 시간이 초과되었습니다."));
    }, 10000);

    window[callbackName] = (data) => {
      clearTimeout(timerId);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      clearTimeout(timerId);
      cleanup();
      reject(new Error("주소 검색 요청에 실패했습니다."));
    };

    document.head.appendChild(script);
  });
}
