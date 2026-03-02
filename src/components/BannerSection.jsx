import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./BannerSection.css";

export const marketBannerSlides = [
  {
    id: "m1",
    eyebrow: "신선한 재료로 간편하게 만드는 집밥",
    title: "닭고기 0% 첨가 프리미엄 밀키트",
    period: "2.17 - 2.23",
    imageSrc: "/img/banner-duck.png",
    imageAlt: "오리 배너 이미지",
    bg: "#ded2bf",
    badges: [
      { label: "공동구매", tone: "dark" },
      { label: "쿠폰할인", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m2",
    eyebrow: "겉바속촉 수제 오븐 레시피",
    title: "에어프라이어로도 가능한 수제 치킨",
    period: "2.24 - 3.02",
    imageSrc: "/img/banner-chicken.png",
    imageAlt: "치킨 배너 이미지",
    bg: "#e8d6c5",
    badges: [
      { label: "한정", tone: "dark" },
      { label: "무료배송", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m3",
    eyebrow: "담백한 연어와 허브의 균형 잡힌 조합",
    title: "노르웨이산 연어 허브 스테이크",
    period: "3.03 - 3.09",
    imageSrc: "/img/banner-salmon.png",
    imageAlt: "연어 배너 이미지",
    bg: "#d9e6e2",
    badges: [
      { label: "프리미엄", tone: "dark" },
      { label: "한정수량", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m4",
    eyebrow: "가볍게 먹어도 든든한 한 그릇",
    title: "비건 단호박 샐러드 보울 세트",
    period: "3.10 - 3.16",
    imageSrc: "/img/banner-veggie.png",
    imageAlt: "샐러드 보울 배너 이미지",
    bg: "#e7e1d1",
    badges: [
      { label: "건강식", tone: "dark" },
      { label: "저칼로리", tone: "light" },
    ],
    to: "/products",
  },
];

/**
 * 자동 슬라이드 배너 섹션
 */
export default function BannerSection({
  slides = [],
  autoPlay = true,
  interval = 5000,
  height = 260,
  maxWidth = 1200,
  showDots = true,
  pauseOnHover = true,
  rounded = 18,
}) {
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const len = safeSlides.length;

  const [index, setIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);

  const timerRef = useRef(null);

  const go = (next) => {
    if (len <= 1) return;
    setIndex((prev) => {
      const n = typeof next === "function" ? next(prev) : next;
      const normalized = ((n % len) + len) % len;
      return normalized;
    });
  };

  const goPrev = () => go((i) => i - 1);
  const goNext = () => go((i) => i + 1);

  useEffect(() => {
    if (!autoPlay || len <= 1) return;
    if (pauseOnHover && isHover) return;

    timerRef.current = setInterval(() => {
      goNext();
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoPlay, interval, len, isHover, pauseOnHover]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!len) return null;

  const styleVars = {
    "--hs-banner-height": `${height}px`,
    "--hs-banner-max": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
    "--hs-banner-radius": `${rounded}px`,
  };

  return (
    <section
      className="hs-bannerCarousel"
      style={styleVars}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      aria-label="메인 배너"
    >
      <div className="hs-bannerCarousel-inner">
        <div className="hs-bannerFrame">
          {safeSlides.map((s, i) => {
            const active = i === index;

            const content = (
              <div className="hs-bannerSlideContent">
                {!!s?.badges?.length && (
                  <div className="hs-bannerBadges" aria-hidden="true">
                    {s.badges.map((b, bi) => (
                      <span
                        key={`${s.id || i}-b-${bi}`}
                        className={`hs-badge ${b.tone === "dark" ? "is-dark" : "is-light"}`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hs-bannerText">
                  {s.eyebrow && <div className="hs-bannerEyebrow">{s.eyebrow}</div>}
                  {s.title && <div className="hs-bannerTitle">{s.title}</div>}
                  {s.period && <div className="hs-bannerPeriod">{s.period}</div>}
                </div>

                <div className="hs-bannerMedia">
                  <img
                    src={s.imageSrc}
                    alt={s.imageAlt || s.title || "배너"}
                    loading={active ? "eager" : "lazy"}
                    className="hs-bannerImg"
                  />
                </div>
              </div>
            );

            return (
              <div
                key={s.id || i}
                className={`hs-bannerSlide ${active ? "is-active" : ""}`}
                style={{ background: s.bg || "#efe7da" }}
                aria-hidden={!active}
              >
                {s.href ? (
                  <a className="hs-bannerLink" href={s.href}>
                    {content}
                  </a>
                ) : s.to ? (
                  <Link className="hs-bannerLink" to={s.to}>
                    {content}
                  </Link>
                ) : (
                  <div className="hs-bannerLink" role="presentation">
                    {content}
                  </div>
                )}
              </div>
            );
          })}

          {len > 1 && (
            <>
              <button
                type="button"
                className="hs-bannerArrow is-left"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="이전 배너"
              >
                <span className="hs-bannerArrowText" aria-hidden="true">
                  {"<"}
                </span>
              </button>

              <button
                type="button"
                className="hs-bannerArrow is-right"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="다음 배너"
              >
                <span className="hs-bannerArrowText" aria-hidden="true">
                  {">"}
                </span>
              </button>
            </>
          )}

          {showDots && len > 1 && (
            <div className="hs-bannerDots" aria-label="배너 페이지 인디케이터">
              {safeSlides.map((_, di) => (
                <button
                  key={`dot-${di}`}
                  type="button"
                  className={`hs-dot ${di === index ? "is-active" : ""}`}
                  onClick={() => go(di)}
                  aria-label={`${di + 1}번 배너로 이동`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
