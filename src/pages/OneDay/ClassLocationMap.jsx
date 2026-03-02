import { useEffect, useMemo, useRef, useState } from "react";
import { geocodeAddress } from "../../api/onedayApi";

/**
 * 원데이 클래스 위치 선택(카카오맵)
 *
 * ✅ 저장 권장 데이터
 * - address: 사용자에게 보여줄 주소
 * - lat: 위도
 * - lng: 경도
 *
 * value 형태:
 * { address: string, lat: number|null, lng: number|null }
 */
export default function ClassLocationMap({ value, onChange }) {
    const mapDomRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const 초기값 = useMemo(() => {
        // 기본값: 서울시청 (원데이 기본 위치 없을 때)
        return {
            address: value?.address ?? "",
            lat: value?.lat ?? 37.5665,
            lng: value?.lng ?? 126.9780,
        };
    }, [value?.address, value?.lat, value?.lng]);

    const [주소입력, set주소입력] = useState(초기값.address);

    const 지도초기화 = () => {
        // ✅ 카카오 SDK 로딩 확인
        if (!window.kakao?.maps) return false;
        if (!mapDomRef.current) return false;
        // 이미 생성된 지도는 중복 생성하지 않음
        if (mapRef.current || markerRef.current) return true;

        const center = new window.kakao.maps.LatLng(초기값.lat, 초기값.lng);

        const map = new window.kakao.maps.Map(mapDomRef.current, {
            center,
            level: 3,
        });
        mapRef.current = map;

        const marker = new window.kakao.maps.Marker({ position: center });
        marker.setMap(map);
        markerRef.current = marker;

        // ✅ 지도 클릭으로 좌표 선택(옵션)
        window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
            const latlng = mouseEvent.latLng;
            marker.setPosition(latlng);

            onChange?.({
                address: value?.address ?? 주소입력 ?? "",
                lat: latlng.getLat(),
                lng: latlng.getLng(),
            });
        });

        return true;
    };

    useEffect(() => {
        // SDK가 이미 준비되었으면 즉시 초기화
        if (지도초기화()) return;

        // SDK 로딩이 늦는 경우를 대비해 짧게 재시도
        const timer = window.setInterval(() => {
            if (지도초기화()) {
                window.clearInterval(timer);
            }
        }, 100);

        return () => window.clearInterval(timer);
    }, []); // 최초 1회만

    // ✅ value가 바뀌었을 때(수정 화면에서 초기 데이터 로딩 등) 지도도 동기화
    useEffect(() => {
        const map = mapRef.current;
        const marker = markerRef.current;
        if (!map || !marker || !window.kakao?.maps) return;

        if (value?.lat && value?.lng) {
            const pos = new window.kakao.maps.LatLng(value.lat, value.lng);
            map.setCenter(pos);
            marker.setPosition(pos);
        }
        if (typeof value?.address === "string") {
            set주소입력(value.address);
        }
    }, [value?.lat, value?.lng, value?.address]);

    /**
     * 주소 검색 -> 백엔드 프록시(/api/oneday/location/geocode) 호출
     * - 프론트에서 REST 키 직접 사용 ❌
     */
    const 주소검색 = async () => {
        const query = 주소입력.trim();
        if (!query) {
            alert("주소를 입력해줘!");
            return;
        }

        try {
            const data = await geocodeAddress(query);
            // data: { address, lat, lng }
            const { address, lat, lng } = data;

            const map = mapRef.current;
            const marker = markerRef.current;
            if (!map || !marker || !window.kakao?.maps) return;

            const pos = new window.kakao.maps.LatLng(lat, lng);
            map.setCenter(pos);
            marker.setPosition(pos);

            onChange?.({ address, lat, lng });
        } catch (e) {
            console.error(e);
            // 네트워크/인증/검색결과 없음을 구분해서 실제 원인을 먼저 보여줍니다.
            const reason = e?.message ? String(e.message) : "주소 검색에 실패했어.";
            alert(`${reason}\n(주소를 도로명+건물번호까지 입력하면 정확도가 올라가요.)`);
        }
    };

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    value={주소입력}
                    onChange={(e) => set주소입력(e.target.value)}
                    placeholder="주소를 입력하세요 (예: 서울 중구 세종대로 110)"
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                    }}
                />
                <button
                    type="button"
                    onClick={주소검색}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                    }}
                >
                    주소 검색
                </button>
            </div>

            <div
                ref={mapDomRef}
                style={{
                    width: "100%",
                    height: 360,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #eee",
                }}
            />

            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                <div>선택 주소: {value?.address ?? "-"}</div>
                <div>
                    위도/경도: {value?.lat ?? "-"} / {value?.lng ?? "-"}
                </div>
                <div style={{ opacity: 0.7 }}>
                    팁: 지도에서 원하는 위치를 직접 클릭해도 좌표가 선택돼.
                </div>
            </div>
        </div>
    );
}
