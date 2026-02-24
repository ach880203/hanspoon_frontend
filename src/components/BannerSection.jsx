import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./BannerSection.css";

export const marketBannerSlides = [
  {
    id: "m1",
    eyebrow: "신선한 오리원육과 천연 훈연으로 담백하고 건강하게 만든",
    title: "첨가물 0% ‘자연누리 무항생제 훈제오리’",
    period: "2.17 - 2.23",
    imageSrc: "/img/banner-duck.png",
    imageAlt: "훈제오리 배너 이미지",
    bg: "#ded2bf",
    badges: [
      { label: "공동구매", tone: "dark" },
      { label: "쿠폰할인", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m2",
    eyebrow: "겉바속촉 시즈닝으로 풍미를 올린",
    title: "에어프라이어로 끝! ‘크리스피 순살치킨’",
    period: "2.24 - 3.02",
    imageSrc: "/img/banner-chicken.png",
    imageAlt: "치킨 배너 이미지",
    bg: "#e8d6c5",
    badges: [
      { label: "런칭", tone: "dark" },
      { label: "한정", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m3",
    eyebrow: "담백한 단백질 & 산뜻한 풍미의 조합",
    title: "노르웨이산 ‘저염 훈제연어 스테이크’",
    period: "3.03 - 3.09",
    imageSrc: "/img/banner-salmon.png",
    imageAlt: "연어 배너 이미지",
    bg: "#d9e6e2",
    badges: [
      { label: "프리미엄", tone: "dark" },
      { label: "특가", tone: "light" },
    ],
    to: "/products",
  },
  {
    id: "m4",
    eyebrow: "가볍게 먹어도 든든한 한 그릇",
    title: "비건 ‘컬러풀 그레인 샐러드 볼’",
    period: "3.10 - 3.16",
    imageSrc: "/img/banner-veggie.png",
    imageAlt: "샐러드 볼 배너 이미지",
    bg: "#e7e1d1",
    badges: [
      { label: "건강식", tone: "dark" },
      { label: "신상품", tone: "light" },
    ],
    to: "/products",
  },
];


/**
 * 자동 슬라이드 배너 섹션 (텍스트 좌 / 이미지 우 / 배지 / 좌우 화살표)
 *
 * slides: [
 *   {
 *     id: "b1",
 *     eyebrow: "신선한 오리원육과 천연 훈연으로 담백하고 건강하게 만든",
 *     title: "첨가물 0% ‘자연누리 무항생제 훈제오리’",
 *     period: "2.17 - 2.23",
 *     imageSrc: "/img/banner1.png",
 *     imageAlt: "훈제오리 접시",
 *     bg: "#ded2bf",
 *     badges: [{ label: "공동구매", tone: "dark" }, { label: "쿠폰할인", tone: "light" }],
 *     to: "/products/123" // 또는 href
 *   }
 * ]
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

  // autoplay
  useEffect(() => {
    if (!autoPlay || len <= 1) return;
    if (pauseOnHover && isHover) return;

    const start = () => {
      timerRef.current = setInterval(() => {
        goNext();
      }, interval);
    };

    start();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoPlay, interval, len, isHover, pauseOnHover]);

  // 페이지 비활성화 시 자동 멈춤(UX)
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
      aria-label="Main banner"
    >
      <div className="hs-bannerCarousel-inner">
        <div className="hs-bannerFrame">
          {safeSlides.map((s, i) => {
            const active = i === index;

            const content = (
              <div className="hs-bannerSlideContent">
                {/* Badges */}
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

                {/* Text */}
                <div className="hs-bannerText">
                  {s.eyebrow && <div className="hs-bannerEyebrow">{s.eyebrow}</div>}
                  {s.title && <div className="hs-bannerTitle">{s.title}</div>}
                  {s.period && <div className="hs-bannerPeriod">{s.period}</div>}
                </div>

                {/* Image */}
                <div className="hs-bannerMedia">
                  <img
                    src={s.imageSrc}
                    alt={s.imageAlt || s.title || "banner"}
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

          {/* Arrows */}
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
                aria-label="Previous banner"
              >
                <IconChevronLeft />
              </button>

              <button
                type="button"
                className="hs-bannerArrow is-right"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next banner"
              >
                <IconChevronRight />
              </button>
            </>
          )}

          {/* Dots */}
          {showDots && len > 1 && (
            <div className="hs-bannerDots" aria-label="Banner pagination">
              {safeSlides.map((_, di) => (
                <button
                  key={`dot-${di}`}
                  type="button"
                  className={`hs-dot ${di === index ? "is-active" : ""}`}
                  onClick={() => go(di)}
                  aria-label={`Go to banner ${di + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function IconChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
