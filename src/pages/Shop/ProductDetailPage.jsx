import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductDetail } from "../../api/products";
import { addMyCartItem, fetchMyCart } from "../../api/carts";
import { toErrorMessage } from "../../api/http";
import WishButton from "../../components/WishButton";
import ReviewSection from "../../components/ReviewSection";
import InquirySection from "../../components/InquirySection";
import { useCart } from "../../contexts/CartContext";
import "./ProductDetailPage.css";

const TABS = [
  { id: "detail", label: "상품상세" },
  { id: "review", label: "상품평" },
  { id: "inquiry", label: "상품문의" },
  { id: "policy", label: "배송/반품/교환 안내" },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeImg, setActiveImg] = useState(null);

  const [activeTab, setActiveTab] = useState("detail");

  const tabBarRef = useRef(null);
  const sectionRefs = useRef({}); // { detail: el, review: el, inquiry: el, policy: el }
  const ratiosRef = useRef(new Map()); // scrollspy 안정화

  const productId = useMemo(() => Number(id), [id]);
  const stock = Math.max(0, Number(data?.stock ?? 0));

  useEffect(() => {
    setErr("");
    setData(null);
    setActiveTab("detail");

    fetchProductDetail(id)
      .then((d) => {
        setData(d);
        setActiveImg(d.thumbnailUrl || d.images?.[0]?.imgUrl || null);
      })
      .catch((e) => setErr(toErrorMessage(e)));
  }, [id]);

  const clampQty = (n) => {
    const normalized = Number.isFinite(n) ? n : 1;
    if (stock <= 0) return 1;
    return Math.min(stock, Math.max(1, normalized));
  };

  const { refreshCount, showToast } = useCart();

  const addToCart = async () => {
    if (!data || stock <= 0) return;
    setBusy(true);
    setErr("");
    try {
      // 1) 담기 전 장바구니 조회(로그인 상태)
      const before = await fetchMyCart().catch(() => null);
      const existed = !!before?.items?.some((it) => it.productId === Number(id));

      // 2) 담기
      await addMyCartItem({ productId: Number(id), quantity: Number(qty) });

      // 3) 뱃지 갱신
      await refreshCount();

      // 4) 토스트 문구 분기
      showToast({
        title: "장바구니에 담았습니다.",
        message: existed
          ? "이미 담은 상품의 수량을 추가했습니다."
          : "장바구니에 새 상품을 담았습니다.",
        imgUrl: activeImg || data.thumbnailUrl,
      });


    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const getHeaderHeight = () => {
    // CSS 변수로 조절 (기본 72px)
    const v = getComputedStyle(document.documentElement).getPropertyValue("--app-header-height");
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 72;
  };

  const getTabBarHeight = () => {
    const el = tabBarRef.current;
    return el ? el.getBoundingClientRect().height : 52;
  };

  const getScrollOffset = () => getHeaderHeight() + getTabBarHeight() + 12;

  const scrollToSection = (tabId) => {
    const el = sectionRefs.current[tabId];
    if (!el) return;

    const offset = getScrollOffset();
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
    setActiveTab(tabId);
  };

  // ✅ Scrollspy: 섹션 도달 시 탭 자동 변경
  useEffect(() => {
    const headerH = getHeaderHeight();
    const tabH = getTabBarHeight();
    const topOffset = headerH + tabH + 8;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.dataset.tab;
          if (!key) return;
          ratiosRef.current.set(key, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        // 가장 많이 보이는 섹션을 activeTab으로
        let best = activeTab;
        let bestRatio = 0;

        for (const [k, r] of ratiosRef.current.entries()) {
          if (r > bestRatio) {
            bestRatio = r;
            best = k;
          }
        }

        if (bestRatio > 0.15 && best !== activeTab) {
          setActiveTab(best);
        }
      },
      {
        root: null,
        // 탭이 sticky로 가려지는 부분만큼 위를 빼고, 아래는 넉넉히
        rootMargin: `-${topOffset}px 0px -60% 0px`,
        threshold: [0, 0.15, 0.3, 0.5, 0.7, 1],
      }
    );

    const els = Object.values(sectionRefs.current).filter(Boolean);
    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [data]); // data 로딩 후 섹션이 생긴 다음에 observe

  if (!data) return <div className="pdContainer">불러오는 중...</div>;
  
  return (
    <div className="pdPage">
      <div className="pdContainer">
        <button className="pdBackBtn" onClick={() => nav(-1)}>
          ← 뒤로가기
        </button>

        {/* ✅ 상단 2분할 */}
        <div className="pdTop">
          {/* 좌: 이미지 */}
          <div className="pdGallery">
            <div className="pdMainImg">
              {activeImg ? (
                <img src={activeImg} alt={data.name} />
              ) : (
                <div className="pdImgPlaceholder">이미지 없음</div>
              )}
            </div>

            <div className="pdThumbs">
              {(data.images || []).map((img) => (
                <button
                  key={img.id}
                  className={img.imgUrl === activeImg ? "pdThumb active" : "pdThumb"}
                  onClick={() => setActiveImg(img.imgUrl)}
                  title={img.originalName}
                  type="button"
                >
                  <img src={img.imgUrl} alt={img.originalName} />
                </button>
              ))}
            </div>
          </div>

          {/* 우: 구매 정보 (데스크탑에서 sticky 느낌) */}
          <div className="pdInfo">
            <div className="pdBadgeRow">
              <span className="pdBadge">{data.category}</span>
              {/* 배송 문구는 백엔드 필드 없으면 일단 고정/옵션 처리 */}
              <span className="pdShip">샛별배송</span>
            </div>

            <h1 className="pdName">{data.name}</h1>

            <div className="pdPriceRow">
              <div className="pdPrice">{Number(data.price).toLocaleString()}원</div>
              <div className="pdStock">재고 {data.stock}</div>
            </div>

            <div className="pdQtyBox">
              <div className="pdQtyLabel">수량</div>
              <div className="pdQtyCtrl">
                <button type="button" onClick={() => setQty((q) => clampQty(q - 1))} disabled={busy || stock <= 0}>
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, stock)}
                  value={qty}
                  onChange={(e) => setQty(clampQty(Number(e.target.value)))}
                  disabled={stock <= 0}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => clampQty(q + 1))}
                  disabled={busy || stock <= 0 || qty >= stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="pdActions">
              <button className="pdCartBtn" disabled={busy || stock <= 0} onClick={addToCart}>
                {busy ? "처리 중.." : stock <= 0 ? "품절" : "장바구니 담기"}
              </button>
              <WishButton productId={id} />
            </div>

            {err && <div className="pdError">{err}</div>}
          </div>
        </div>

        {/* ✅ 탭 sticky 바 */}
        <div className="pdTabBar" ref={tabBarRef}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === activeTab ? "pdTab active" : "pdTab"}
              onClick={() => scrollToSection(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ✅ 섹션들 */}
        <section
          className="pdSection"
          data-tab="detail"
          ref={(el) => (sectionRefs.current.detail = el)}
        >
          <h2 className="pdSectionTitle">상품상세</h2>

          {/* 백엔드 필드에 맞춰서 골라 쓰기 */}
          {data.description && <p className="pdText">{data.description}</p>}

          {/* 상세 이미지(있으면 아래로 길게) */}
          <div className="pdDetailImgs">
            {(data.detailImages || data.images || []).map((img) => (
              <img key={`detail-${img.id}`} src={img.imgUrl} alt={img.originalName || data.name} />
            ))}
          </div>
        </section>

        <section
          className="pdSection"
          data-tab="review"
          ref={(el) => (sectionRefs.current.review = el)}
        >
          <h2 className="pdSectionTitle">상품평</h2>
          <ReviewSection productId={id} />
        </section>

        <section
          className="pdSection"
          data-tab="inquiry"
          ref={(el) => (sectionRefs.current.inquiry = el)}
        >
          <h2 className="pdSectionTitle">상품문의</h2>
          <InquirySection productId={id} />
        </section>

        <section
          className="pdSection"
          data-tab="policy"
          ref={(el) => (sectionRefs.current.policy = el)}
        >
          <h2 className="pdSectionTitle">배송/반품/교환 안내</h2>

          <div className="pdPolicyBox">
            <h3>배송</h3>
            <ul>
              <li>지역/시간대에 따라 배송 방식 및 도착 시간이 달라질 수 있습니다.</li>
              <li>냉장/냉동 상품은 수령 즉시 보관을 권장합니다.</li>
            </ul>

            <h3>반품/교환</h3>
            <ul>
              <li>신선/냉장/냉동 상품은 상품 하자/오배송 등 예외 사유 외 단순 변심 반품이 제한될 수 있습니다.</li>
              <li>상품에 문제가 있다면 사진과 함께 문의를 남겨주세요.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
