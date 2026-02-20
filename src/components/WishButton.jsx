import { useEffect, useState } from "react";
import { isWished, toggleWish } from "../api/productWishes";
import { toErrorMessage } from "../api/http";

export default function WishButton({ productId, onChanged }) {
  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setErr("");
    isWished(productId)
      .then((r) => mounted && setWished(!!r?.wished))
      .catch((e) => {
        // 로그인 안 했으면 401 -> 조용히 무시하거나 문구 표시
        setErr(toErrorMessage(e));
      });
    return () => { mounted = false; };
  }, [productId]);

  const onToggle = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await toggleWish(productId);
      setWished(!!r?.wished);
      onChanged?.(!!r?.wished);
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button className={wished ? "danger" : ""} disabled={busy} onClick={onToggle}>
        {busy ? "..." : wished ? "♥ 찜 해제" : "♡ 찜하기"}
      </button>
      {err && <div className="muted" style={{ fontSize: 12 }}>{err}</div>}
    </div>
  );
}
