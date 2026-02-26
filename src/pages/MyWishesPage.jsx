import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyWishes, toggleWish } from "../api/productWishes";
import { toErrorMessage } from "../api/http";

export default function MyWishesPage() {
  const nav = useNavigate();
  const [data, setData] = useState(null); // Page
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);

  const load = async (p = page) => {
    setErr("");
    try {
      const d = await fetchMyWishes(p, 20);
      setData(d);
      setPage(d?.number ?? p);
    } catch (e) {
      setErr(toErrorMessage(e));
      setData(null);
    }
  };

  useEffect(() => { load(0); }, []);

  const unWish = async (productId) => {
    setBusy(true);
    setErr("");
    try {
      await toggleWish(productId);
      await load(page);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const list = data?.content || [];

  return (
    <div>
      <h1>내 찜 목록</h1>
      {err && <div className="error">{err}</div>}

      <div className="panel">
        {list.length === 0 ? (
          <div className="muted">관심목록이 비었습니다.</div>
        ) : (
          <div className="cartList">
            {list.map((w) => (
              <div key={w.wishId} className="cartItem">
                <div className="cartThumb">
                  {w.thumbnailUrl ? (
                    <img src={w.thumbnailUrl} alt={w.name} />
                  ) : (
                    <div className="thumbPlaceholder">이미지 없음</div>
                  )}
                </div>

                <div className="cartInfo">
                  <div className="title" style={{ cursor: "pointer" }} onClick={() => nav(`/products/${w.productId}`)}>
                    {w.name}
                  </div>
                  <div className="muted">{w.price?.toLocaleString?.() ?? w.price}원</div>
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    <button className="ghost" onClick={() => nav(`/products/${w.productId}`)}>상품 보기</button>
                    <button className="danger" disabled={busy} onClick={() => unWish(w.productId)}>찜 해제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && (
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <button className="ghost" disabled={busy || data.number <= 0} onClick={() => load(data.number - 1)}>이전</button>
            <div className="muted">페이지 {data.number + 1} / {data.totalPages}</div>
            <button className="ghost" disabled={busy || data.number + 1 >= data.totalPages} onClick={() => load(data.number + 1)}>다음</button>
          </div>
        )}
      </div>
    </div>
  );
}

