import { useEffect, useMemo, useRef, useState } from "react";

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function OneDayLocationViewer({ address, lat, lng, height = 280 }) {
  const mapDomRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(Boolean(window.kakao?.maps));

  const normalizedAddress = String(address || "").trim();
  const parsedLat = useMemo(() => toFiniteNumber(lat), [lat]);
  const parsedLng = useMemo(() => toFiniteNumber(lng), [lng]);
  const canRenderMap = parsedLat != null && parsedLng != null;

  useEffect(() => {
    if (window.kakao?.maps) {
      setSdkReady(true);
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (window.kakao?.maps) {
        setSdkReady(true);
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sdkReady || !canRenderMap) return;
    if (!mapDomRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(parsedLat, parsedLng);

    if (!mapRef.current || !markerRef.current) {
      const map = new window.kakao.maps.Map(mapDomRef.current, {
        center,
        level: 3,
      });
      const marker = new window.kakao.maps.Marker({ position: center });
      marker.setMap(map);
      mapRef.current = map;
      markerRef.current = marker;
      return;
    }

    mapRef.current.setCenter(center);
    markerRef.current.setPosition(center);
  }, [sdkReady, canRenderMap, parsedLat, parsedLng]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {normalizedAddress ? (
        <div style={{ fontSize: 13, color: "#334155" }}>
          <strong>주소:</strong> {normalizedAddress}
        </div>
      ) : null}

      {canRenderMap ? (
        <div
          ref={mapDomRef}
          style={{
            width: "100%",
            height,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            background: "#f8fafc",
          }}
        />
      ) : (
        <div
          style={{
            border: "1px dashed #cbd5e1",
            borderRadius: 12,
            padding: "12px 14px",
            color: "#64748b",
            background: "#f8fafc",
            fontSize: 13,
          }}
        >
          위치 정보가 아직 등록되지 않았습니다.
        </div>
      )}
    </div>
  );
}
