import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";
import BannerSection, { marketBannerSlides } from "../components/BannerSection";
import { useEffect, useState } from "react";
import RollingGridSection from "../components/RollingGridSection";
import { getOneDayClasses } from "../api/onedayApi";
import { fetchProducts } from "../api/products";
import { getRecipeList } from "../api/recipeApi"; 


const FALLBACK_RECIPE_IMG = "/img/banner-chicken.png";
const FALLBACK_CLASS_IMG = "/img/banner-duck.png";
const FALLBACK_PRODUCT_IMG = "/img/banner-salmon.png";

function toCardPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "";
  return `${num.toLocaleString("ko-KR")}원`;
}

export default function HomePage() {
  const { user, logout } = useAuth();

    // preview states
  const [recipeItems, setRecipeItems] = useState([]);
  const [classItems, setClassItems] = useState([]);
  const [marketItems, setMarketItems] = useState([]);

  const [loading, setLoading] = useState({ recipes: true, classes: true, market: true });
  const [error, setError] = useState({ recipes: "", classes: "", market: "" });

  const RECIPE_BASE_IMG = "http://localhost:8080/images/recipe/";
  const RECIPE_DEFAULT_IMG = "/images/recipe/default.jpg";

  useEffect(() => {
    let ignore = false;

    // 1) Recipes (3분할이니까 최소 6개 정도 가져오면 롤링이 자연스러움)
    (async () => {
      setLoading((s) => ({ ...s, recipes: true }));
      setError((s) => ({ ...s, recipes: "" }));

      try {
        // 홈 미리보기용: 6개 정도(3개씩 롤링 2페이지)
        const res = await getRecipeList({ keyword: "", category: "", page: 0, size: 6 });
        const list = res?.data?.content ?? [];

        const mapped = list.map((r) => ({
          id: r.id,
          title: r.title,
          sub: `리뷰 ${r.reviewCount || 0}`,
          chip: r.category ? r.category : "", // 서버에 category 필드가 있으면 표시
          imageSrc: r.recipeImg ? `${RECIPE_BASE_IMG}${r.recipeImg}` : RECIPE_DEFAULT_IMG,
          imageAlt: r.title,
          to: `/recipes/${r.id}`, // 리스트 페이지랑 동일한 상세 라우트
        }));

        if (!ignore) setRecipeItems(mapped);
      } catch {
        if (!ignore) setError((s) => ({ ...s, recipes: "레시피를 불러오지 못했습니다." }));
        if (!ignore) setRecipeItems([]);
      } finally {
        if (!ignore) setLoading((s) => ({ ...s, recipes: false }));
      }
    })();

    // 2) Classes (4분할 → 8개 정도)
    (async () => {
      setLoading((s) => ({ ...s, classes: true }));
      setError((s) => ({ ...s, classes: "" }));
      try {
        const data = await getOneDayClasses({ page: 0, size: 8, sort: "createdAt,desc" });
        const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
        const mapped = list.map((c, idx) => {
          const id = c?.id ?? c?.classId ?? `c-${idx}`;
          const title = c?.title ?? c?.classTitle ?? "원데이 클래스";
          const category = c?.categoryLabel ?? c?.category ?? "";
          const level = c?.levelLabel ?? c?.level ?? "";
          const runType = c?.runType ?? ""; // ALWAYS / EVENT 등
          return {
            id,
            title,
            sub: [category, level].filter(Boolean).join(" · "),
            chip: runType,
            imageSrc: c?.thumbnailUrl || c?.imageUrl || FALLBACK_CLASS_IMG,
            imageAlt: title,
            to: `/classes/oneday/classes/${id}`,
          };
        });
        if (!ignore) setClassItems(mapped);
      } catch (e) {
        if (!ignore) setError((s) => ({ ...s, classes: e?.message || "클래스를 불러오지 못했습니다." }));
        if (!ignore) setClassItems([]);
      } finally {
        if (!ignore) setLoading((s) => ({ ...s, classes: false }));
      }
    })();

    // 3) Market (4분할 → 8개 정도)
    (async () => {
      setLoading((s) => ({ ...s, market: true }));
      setError((s) => ({ ...s, market: "" }));
      try {
        const data = await fetchProducts({ page: 0, size: 8, sort: "LATEST" });
        const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        const mapped = list.map((p, idx) => {
          const id = p?.id ?? `p-${idx}`;
          const title = p?.itemNm ?? p?.name ?? p?.productName ?? "상품";
          const price = toCardPrice(p?.price);
          const origin = p?.originPrice ? toCardPrice(p.originPrice) : "";
          const discount = p?.discountRate ? `${p.discountRate}%` : "";
          return {
            id,
            title,
            sub: p?.subTitle ?? p?.summary ?? "",
            badge: p?.badge ?? "", // 필요하면 서버에서 내려줘도 됨
            discount,
            price,
            originPrice: origin,
            imageSrc: p?.imgUrl || p?.imageUrl || p?.thumbnailUrl || FALLBACK_PRODUCT_IMG,
            imageAlt: title,
            // ⚠️ 상세 라우트는 프로젝트에 맞게 수정
            to: `/products/${id}`,
          };
        });
        if (!ignore) setMarketItems(mapped);
      } catch (e) {
        if (!ignore) setError((s) => ({ ...s, market: e?.message || "상품을 불러오지 못했습니다." }));
        if (!ignore) setMarketItems([]);
      } finally {
        if (!ignore) setLoading((s) => ({ ...s, market: false }));
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="home-container">

      {/* 배너 섹션 */}
      <BannerSection slides={marketBannerSlides} interval={4500} />


      {/* ✅ 배너 아래 섹션 3개 */}
      <RollingGridSection
        title="RECIPES"
        moreTo="/recipes/list"
        perPage={3}
        items={recipeItems}
        loading={loading.recipes}
        error={error.recipes}
      />

      <RollingGridSection
        title="CLASSES"
        moreTo="/classes/oneday"
        perPage={4}
        items={classItems}
        loading={loading.classes}
        error={error.classes}
      />

      <RollingGridSection
        title="MARKET"
        moreTo="/products"
        perPage={4}
        items={marketItems}
        loading={loading.market}
        error={error.market}
      />

      
      <div className="home-hero">
        <div className="hero-text">
          <h1>
            요리의 즐거움을
            <br />
            <span style={{ color: "var(--primary)" }}>한스푼</span>과 함께
          </h1>
          <p>
            레시피, 원데이 클래스, 신선한 식재료까지.
            한 번에 둘러보고 바로 시작해 보세요.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/recipes/list" className="btn-auth-primary" style={{ display: "inline-block" }}>
              레시피 둘러보기
            </Link>
          </div>
        </div>
      </div>

      <div className="home-layout">
        <aside className="login-aside">
          {user ? (
            <section className="auth-panel profile-panel">
              <div className="profile-info">
                <div className="profile-avatar">👤</div>
                <div className="profile-details">
                  <h3 className="user-name">{user.userName || "사용자"}님</h3>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="auth-btn-grid">
                <Link to="/mypage" className="btn-auth-secondary">마이페이지</Link>
                <button onClick={logout} className="btn-logout-small">로그아웃</button>
              </div>
            </section>
          ) : (
            <section className="auth-panel">
              <h3>로그인</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                더 많은 기능을 사용하려면
                <br />
                로그인해 주세요.
              </p>
              <div className="auth-btn-grid">
                <Link to="/login" className="btn-auth-primary">로그인</Link>
                <Link to="/signup" className="btn-auth-secondary">회원가입</Link>
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12 }}>
                <Link to="/find-id" className="sublink">아이디 찾기</Link>
                <Link to="/find-password" className="sublink">비밀번호 찾기</Link>
              </div>
            </section>
          )}
        </aside>

        <main className="main-content">
          <UseCaseCard
            icon="🍳"
            title="레시피"
            description="다양한 요리법을 찾고 직접 만든 레시피를 공유해 보세요."
            links={[
              { to: "/recipes", label: "레시피 등록" },
              { to: "/recipes/user", label: "내 레시피" },
              { to: "/recipes/list", label: "레시피 리스트" },
              { to: "/recipes/deletelist", label: "삭제 레시피" },
            ]}
            sublinks={[
              { to: "/reviews", label: "리뷰" },
              { to: "/wishlist", label: "관심 목록" },
            ]}
          />

          <UseCaseCard
            icon="🧑‍🍳"
            title="원데이 클래스"
            description="전문 셰프와 함께하는 실습형 클래스에 참여해 보세요."
            links={[
              { to: "/classes/oneday", label: "원데이 홈" },
              { to: "/classes/oneday/classes?runType=ALWAYS", label: "정기 클래스" },
              { to: "/classes/oneday/classes?runType=EVENT", label: "이벤트 클래스" },
            ]}
            sublinks={[
              { to: "/classes/oneday/wishes", label: "찜 목록" },
              { to: "/classes/oneday/inquiry", label: "클래스 문의" },
              { to: "/classes/oneday/reservations", label: "예약 내역" },
            ]}
          />

          <UseCaseCard
            icon="🛒"
            title="마켓"
            description="신선한 식재료와 주방 용품을 한 곳에서 만나보세요."
            links={[
              { to: "/products?category=INGREDIENT", label: "식재료" },
              { to: "/products?category=MEAL_KIT", label: "밀키트" },
              { to: "/products", label: "전체 상품" },
            ]}
            sublinks={[
              { to: "/cart", label: "장바구니" },
              { to: "/orders", label: "주문/배송" },
            ]}
          />

          <UseCaseCard
            icon="📢"
            title="고객지원"
            description="공지사항과 자주 묻는 질문을 확인하고 필요한 정보를 빠르게 찾아보세요."
            links={[
              { to: "/notice", label: "공지사항" },
              { to: "/faq", label: "자주 묻는 질문" },
            ]}
            sublinks={[]}
          />

          <UseCaseCard
            icon="👤"
            title="마이페이지"
            links={[
              { to: "/mypage/profile", label: "정보 수정" },
              { to: "/mypage/orders", label: "주문 관리" },
              { to: "/mypage/wishlist", label: "관심 목록" },
            ]}
          />

          <UseCaseCard
            icon="🛠"
            title="관리자"
            links={[
              { to: "/admin/users", label: "회원" },
              { to: "/admin/market", label: "상품" },
              { to: "/admin/classes", label: "클래스" },
            ]}
          />
        </main>
      </div>
    </div>
  );
}

function UseCaseCard({ icon, title, description, links, sublinks }) {
  return (
    <div className="use-case-card">
      <div className="card-title">
        <span style={{ fontSize: 28 }}>{icon}</span>
        {title}
      </div>
      {description && <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>{description}</p>}

      <div className="card-links">
        {links.map((x) => (
          <Link key={x.to} to={x.to} className="pill-link">{x.label}</Link>
        ))}
      </div>

      {sublinks?.length > 0 && (
        <div className="sublinks-section">
          {sublinks.map((x) => (
            <Link key={x.to} to={x.to} className="sublink">{x.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
