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
      setError("Address search key is missing. Set VITE_JUSO_API_KEY.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchJusoJsonp(trimmedKeyword, targetPage, COUNT_PER_PAGE);
      const { common, juso } = data?.results ?? {};

      if (common?.errorCode !== "0") {
        setError(common?.errorMessage || "Address search failed.");
        setResults([]);
        return;
      }

      setResults(juso || []);
      setTotalCount(Number(common?.totalCount) || 0);
      setPage(targetPage);
      setIsOpen(true);
    } catch {
      setError("Address search failed. Please try again.");
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
          placeholder="Search by road name, building name, or lot number"
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
          Search
        </button>
      </div>

      {error && <div className="address-search__error">{error}</div>}

      {isOpen && results.length > 0 && (
        <div className="address-search__dropdown">
          <div className="address-search__result-info">
            Total <b>{totalCount.toLocaleString()}</b> ({page}/{totalPages})
          </div>

          <ul className="address-search__list">
            {results.map((juso, index) => (
              <li
                key={`${juso.roadAddr}-${juso.zipNo}-${index}`}
                className="address-search__item"
                onClick={() => handleSelect(juso)}
              >
                <div className="address-search__item-road">
                  <span className="address-search__badge road">Road</span>
                  {juso.roadAddr}
                </div>

                {juso.jibunAddr && (
                  <div className="address-search__item-jibun">
                    <span className="address-search__badge jibun">Jibun</span>
                    {juso.jibunAddr}
                  </div>
                )}

                <div className="address-search__item-zip">Zip: {juso.zipNo}</div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="address-search__pagination">
              <button disabled={page <= 1} onClick={() => search(page - 1)}>
                Prev
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => search(page + 1)}>
                Next
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
      reject(new Error("Address search request timed out."));
    }, 10000);

    window[callbackName] = (data) => {
      clearTimeout(timerId);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      clearTimeout(timerId);
      cleanup();
      reject(new Error("Address search request failed."));
    };

    document.head.appendChild(script);
  });
}
