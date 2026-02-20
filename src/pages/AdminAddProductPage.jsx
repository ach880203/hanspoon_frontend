import { useMemo, useState } from "react";
import { createProductWithImages } from "../api/products";
import { toErrorMessage } from "../api/http";
import { useNavigate } from "react-router-dom";

const CATS = ["INGREDIENT", "MEAL_KIT", "KITCHEN_SUPPLY"];

export default function AdminAddProductPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    category: "INGREDIENT",
    name: "",
    price: 0,
    stock: 0,
  });

  const [files, setFiles] = useState([]);
  const [repIndex, setRepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => form.name.trim() && files.length >= 1, [form.name, files.length]);

  const submit = async () => {
    setErr("");

    if (files.length < 1) {
      setErr("이미지는 최소 1장 이상 필수입니다.");
      return;
    }

    setBusy(true);
    try {
      const created = await createProductWithImages({
        product: {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        },
        files,
        repIndex: Number(repIndex),
      });

      const productId = created?.id;
      if (!productId) {
        console.log("create response:", created);
        throw new Error("응답에서 product id를 찾을 수 없습니다. 콘솔 로그를 확인하세요.");
      }

      nav(`/products/${productId}`);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Admin: Add Product</h1>

      <div className="panel">
        {err && <div className="error">{err}</div>}

        <div className="grid2">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            placeholder="상품명"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid2" style={{ marginTop: 8 }}>
          <input
            type="number"
            placeholder="가격"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="재고"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="muted">이미지(최소 1장 필수)</div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <div className="muted" style={{ marginTop: 6 }}>선택: {files.length}개</div>

          {files.length > 0 && (
            <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span className="muted">대표 이미지 index:</span>
              <input
                type="number"
                min={0}
                max={Math.max(0, files.length - 1)}
                value={repIndex}
                onChange={(e) => setRepIndex(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
          )}
        </div>

        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button disabled={!canSubmit || busy} onClick={submit}>
            {busy ? "등록중..." : "등록(이미지 포함)"}
          </button>
          <button className="ghost" onClick={() => nav("/products")}>목록으로</button>
        </div>
      </div>
    </div>
  );
}
