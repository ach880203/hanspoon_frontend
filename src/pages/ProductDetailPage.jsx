import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductDetail } from "../api/products";
import { addMyCartItem } from "../api/carts";
import { toErrorMessage } from "../api/http";
import WishButton from "../components/WishButton";
import ReviewSection from "../components/ReviewSection";
import InquirySection from "../components/InquirySection";

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeImg, setActiveImg] = useState(null);

  useEffect(() => {
    setErr("");
    fetchProductDetail(id)
      .then((d) => {
        setData(d);
        setActiveImg(d.thumbnailUrl || d.images?.[0]?.imgUrl || null);
      })
      .catch((e) => setErr(toErrorMessage(e)));
  }, [id]);

  const addToCart = async () => {
    if (!data) return;
    setBusy(true);
    setErr("");
    try {
      await addMyCartItem({ productId: Number(id), quantity: Number(qty) });
      nav("/cart");
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <div>불러오는 중...</div>;

  return (
    <div>
      <button className="linkBtn" onClick={() => nav(-1)}>뒤로가기</button>

      <div className="detail">
        <div className="detailLeft">
          <div className="detailMainImg">
            {activeImg ? <img src={activeImg} alt={data.name} /> : <div className="thumbPlaceholder">이미지 없음</div>}
          </div>
          <div className="detailStrip">
            {(data.images || []).map((img) => (
              <button
                key={img.id}
                className={img.imgUrl === activeImg ? "imgBtn active" : "imgBtn"}
                onClick={() => setActiveImg(img.imgUrl)}
                title={img.originalName}
              >
                <img src={img.imgUrl} alt={img.originalName} />
              </button>
            ))}
          </div>
        </div>

        <div className="detailRight">
          <div className="badge">{data.category}</div>
          <h1 style={{ margin: "8px 0" }}>{data.name}</h1>
          <div className="priceBig">{data.price.toLocaleString()}원</div>
          <div className="muted">재고 {data.stock}</div>

          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: 120 }}
            />
            <button disabled={busy} onClick={addToCart}>
              {busy ? "처리 중.." : "장바구니 담기"}
            </button>

            <WishButton productId={id} />
          </div>

          {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
        </div>

        <ReviewSection productId={id} />
        <InquirySection productId={id} />
        
      </div>
    </div>
  );
}
