// src/pages/AddressTestPage.jsx  ← 테스트 완료 후 삭제해도 됩니다
import { useState } from "react";
import AddressSearch from "../components/AddressSearch";

export default function AddressTestPage() {
    const [result, setResult] = useState(null);
    const [detail, setDetail] = useState("");

    return (
        <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
            <h2 style={{ marginBottom: 24 }}>🔍 주소 검색 테스트</h2>

            <AddressSearch
                onSelect={(addr) => {
                    setResult(addr);
                    setDetail("");
                }}
            />

            {result && (
                <div
                    style={{
                        marginTop: 16,
                        padding: "16px",
                        background: "#f9fafb",
                        borderRadius: 10,
                        border: "1.5px solid #e5e7eb",
                    }}
                >
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>선택된 주소</div>
                    <div>📮 우편번호: <b>{result.zipCode}</b></div>
                    <div style={{ marginTop: 4 }}>🏠 기본주소: {result.address1}</div>

                    <input
                        style={{ marginTop: 12, width: "100%", padding: "8px 12px", borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 14 }}
                        placeholder="상세 주소 입력 (동/호수 등)"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                    />

                    {detail && (
                        <div
                            style={{ marginTop: 12, padding: "12px", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151" }}
                        >
                            ✅ 최종 주소: {result.address1} {detail} ({result.zipCode})
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
