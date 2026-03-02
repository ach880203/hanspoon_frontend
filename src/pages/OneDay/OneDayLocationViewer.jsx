import { useEffect, useMemo, useRef, useState } from "react";
import { ensureKakaoMapSdkLoaded } from "../../utils/kakaoMapSdk";

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function OneDayLocationViewer({ address, lat, lng, height = 280 }) {
  const mapDomRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(Boolean(window.kakao?.maps));
  const [resolvedCoords, setResolvedCoords] = useState({ lat: null, lng: null });

  const normalizedAddress = String(address || "").trim();
  const parsedLat = useMemo(() => toFiniteNumber(lat), [lat]);
  const parsedLng = useMemo(() => toFiniteNumber(lng), [lng]);
  const effectiveLat = parsedLat ?? resolvedCoords.lat;
  const effectiveLng = parsedLng ?? resolvedCoords.lng;
  const canRenderMap = effectiveLat != null && effectiveLng != null;

  useEffect(() => {
    let cancelled = false;
    ensureKakaoMapSdkLoaded()
      .then(() => {
        if (!cancelled && window.kakao?.maps) {
          setSdkReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSdkReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (parsedLat != null && parsedLng != null) {
      setResolvedCoords({ lat: null, lng: null });
      return;
    }
    if (!sdkReady || !normalizedAddress || !window.kakao?.maps?.services) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    let cancelled = false;

    // 저장 데이터에 주소만 있고 좌표가 없는 기존 클래스를 위해 주소 -> 좌표 보완 조회를 수행합니다.
    geocoder.addressSearch(normalizedAddress, (result, status) => {
      if (cancelled) return;
      if (status !== window.kakao.maps.services.Status.OK || !Array.isArray(result) || result.length === 0) {
        setResolvedCoords({ lat: null, lng: null });
        return;
      }

      const first = result[0];
      const nextLat = toFiniteNumber(first?.y);
      const nextLng = toFiniteNumber(first?.x);
      setResolvedCoords({ lat: nextLat, lng: nextLng });
    });

    return () => {
      cancelled = true;
    };
  }, [sdkReady, normalizedAddress, parsedLat, parsedLng]);

  useEffect(() => {
    if (!sdkReady || !canRenderMap) return;
    if (!mapDomRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(effectiveLat, effectiveLng);

    if (!mapRef.current || !markerRef.current) {
      const map = new window.kakao.maps.Map(mapDomRef.current, {
        center,
        level: 3,
      });
      const marker = new window.kakao.maps.Marker({ position: center });
      marker.setMap(map);
      mapRef.current = map;
      markerRef.current = marker;
      map.relayout();
      return;
    }

    mapRef.current.relayout();
    mapRef.current.setCenter(center);
    markerRef.current.setPosition(center);
  }, [sdkReady, canRenderMap, effectiveLat, effectiveLng]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {normalizedAddress ? (
        <div style={{ fontSize: 13, color: "#334155" }}>
          <strong>주소:</strong> {normalizedAddress}
        </div>
      ) : null}

      {sdkReady && canRenderMap ? (
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
          {canRenderMap ? "지도를 불러오는 중입니다." : "위치 정보가 아직 등록되지 않았습니다."}
        </div>
      )}
    </div>
  );
}
