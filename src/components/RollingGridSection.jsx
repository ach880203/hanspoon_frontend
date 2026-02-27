import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import "./RollingGridSection.css";

/**
 * wtable-ish rolling grid section
 *
 * items: [
 *  {
 *    id, title, sub, chip, badge,
 *    imageSrc, imageAlt,
 *    discount, price, originPrice,
 *    to, href
 *  }
 * ]
 */
export default function RollingGridSection({
  title,
  moreTo,
  items = [],
  perPage = 4,
  loading = false,
  error = "",
  variant = "default",
}) {
  const safe = useMemo(() => items.filter(Boolean), [items]);
  const len = safe.length;

  const pageCount = useMemo(() => {
    if (len === 0) return 0;
    return Math.ceil(len / perPage);
  }, [len, perPage]);

  const [page, setPage] = useState(0);
  const canRoll = pageCount > 1;

  const visible = useMemo(() => {
    if (len === 0) return [];
    const start = (page * perPage) % len;
    const out = [];
    for (let i = 0; i < perPage; i++) out.push(safe[(start + i) % len]);
    return out;
  }, [safe, len, page, perPage]);

  const prev = () => canRoll && setPage((p) => (p - 1 + pageCount) % pageCount);
  const next = () => canRoll && setPage((p) => (p + 1) % pageCount);

  return (
    <section className={`rg-section rg-section-${variant}`}>
      <div className="rg-head">
        <div className="rg-title">{title}</div>
        <Link to={moreTo} className="rg-more">
          더보기 &gt;
        </Link>
      </div>

      {error && <div className="rg-error">에러: {error}</div>}

      <div className="rg-body">
        {!loading && canRoll && (
          <>
            <button className="rg-arrow rg-left" onClick={prev} aria-label={`${title} 이전`}>
              <IconChevronLeft />
            </button>
            <button className="rg-arrow rg-right" onClick={next} aria-label={`${title} 다음`}>
              <IconChevronRight />
            </button>
          </>
        )}

        <div className={`rg-grid rg-grid-${perPage}`}>
          {loading
            ? Array.from({ length: perPage }).map((_, i) => <div key={i} className="rg-skeleton" />)
            : visible.map((it, i) => <CardItem key={`${it.id}-${i}`} item={it} variant={variant} />)}
        </div>

        {!loading && canRoll && (
          <div className="rg-indicators" aria-label={`${title} pages`}>
            {Array.from({ length: pageCount }).map((_, pi) => (
              <button
                key={`rg-indicator-${pi}`}
                type="button"
                className={`rg-indicator ${pi === page ? "is-active" : ""}`}
                onClick={() => setPage(pi)}
                aria-label={`${title} ${pi + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CardItem({ item, variant = "default" }) {
  const content = (
    <>
      <div className="rg-thumb">
        {item.badge && <span className="rg-badge">{item.badge}</span>}
        <img src={item.imageSrc} alt={item.imageAlt || item.title} loading="lazy" />
      </div>

      <div className="rg-meta">
        {item.chip && <div className="rg-chip">{item.chip}</div>}
        <div className="rg-itemTitle">{item.title}</div>
        {item.sub && <div className="rg-sub">{item.sub}</div>}

        {(item.discount || item.price || item.originPrice) && (
          <div className="rg-priceRow">
            {item.discount && <span className="rg-discount">{item.discount}</span>}
            {item.price && <span className="rg-price">{item.price}</span>}
            {item.originPrice && <span className="rg-origin">{item.originPrice}</span>}
          </div>
        )}
      </div>
    </>
  );

  if (item.href) {
    return (
      <a className={`rg-card rg-card-${variant}`} href={item.href}>
        {content}
      </a>
    );
  }

  return (
    <Link className={`rg-card rg-card-${variant}`} to={item.to || "/"}>
      {content}
    </Link>
  );
}

function IconChevronLeft() {
  return <span className="rg-arrowText" aria-hidden="true">{"<"}</span>;
}
function IconChevronRight() {
  return <span className="rg-arrowText" aria-hidden="true">{">"}</span>;
}
