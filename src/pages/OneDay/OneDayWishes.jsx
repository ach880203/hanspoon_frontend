import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMyOneDayWishes,
  getOneDayClasses,
  getOneDayClassSessions,
  isSessionCompleted,
  toggleOneDayWish,
} from "../../api/onedayApi";
import { OneDayTopTabs } from "./OneDayTopTabs";

export const OneDayWishes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedClassId = searchParams.get("selectedClassId") || "";

  const [wishes, setWishes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [slotStatusByClassId, setSlotStatusByClassId] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getOneDayClasses({ page: 0, size: 200 });
        const list = Array.isArray(data) ? data : data?.content ?? [];
        setClasses(list);
      } catch {
        setClasses([]);
      }
    })();
  }, []);

  const loadWishes = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getMyOneDayWishes();
      const list = Array.isArray(data) ? data : [];
      setWishes(list);
      setMessage(`찜 ${list.length}건`);
    } catch (e) {
      setError(e?.message ?? "찜 목록 조회 실패");
      setWishes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  useEffect(() => {
    let cancelled = false;

    const resolveSlotStatuses = async () => {
      const classIds = [...new Set(wishes.map((x) => Number(x.classProductId)).filter((x) => x > 0))];
      if (classIds.length === 0) {
        setSlotStatusByClassId({});
        return;
      }

      const checks = await Promise.all(
        classIds.map(async (classId) => {
          try {
            const sessions = await getOneDayClassSessions(classId);
            const list = Array.isArray(sessions) ? sessions : [];
            const timeList = list.map((s) => Date.parse(s?.startAt ?? "")).filter((t) => !Number.isNaN(t));

            if (timeList.length === 0) {
              return { classId, amCompleted: false, pmCompleted: false, amFull: false, pmFull: false };
            }

            // 초보자 참고:
            // 찜 목록에서도 클래스별 오전/오후 상태를 따로 표시하기 위해
            // 슬롯(AM/PM) 단위로 완료/마감 상태를 각각 계산합니다.
            const amSessions = list.filter((s) => s?.slot === "AM");
            const pmSessions = list.filter((s) => s?.slot === "PM");

            const calc = (sessions) => {
              if (sessions.length === 0) return { completed: false, full: false };
              const completed = sessions.every((s) => isSessionCompleted(s?.startAt));
              if (completed) return { completed: true, full: false };

              const futureSessions = sessions.filter((s) => !isSessionCompleted(s?.startAt));
              if (futureSessions.length === 0) return { completed: true, full: false };

              const full = futureSessions.every((s) => {
                const capacity = Number(s?.capacity ?? 0);
                const reserved = Number(s?.reservedCount ?? 0);
                return Boolean(s?.full) || capacity <= reserved;
              });

              return { completed: false, full };
            };

            const am = calc(amSessions);
            const pm = calc(pmSessions);
            return {
              classId,
              amCompleted: am.completed,
              pmCompleted: pm.completed,
              amFull: am.full,
              pmFull: pm.full,
            };
          } catch {
            return { classId, amCompleted: false, pmCompleted: false, amFull: false, pmFull: false };
          }
        })
      );

      if (cancelled) return;
      const map = {};
      checks.forEach((x) => {
        map[x.classId] = {
          amCompleted: x.amCompleted,
          pmCompleted: x.pmCompleted,
          amFull: x.amFull,
          pmFull: x.pmFull,
        };
      });
      setSlotStatusByClassId(map);
    };

    resolveSlotStatuses();
    return () => {
      cancelled = true;
    };
  }, [wishes]);

  const classOptions = useMemo(() => classes.map((c) => ({ id: c.id, title: c.title })), [classes]);

  const onSelectClass = (value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete("selectedClassId");
    else next.set("selectedClassId", value);
    setSearchParams(next, { replace: true });
  };

  const handleToggle = async () => {
    const classId = Number(selectedClassId);
    if (!classId) {
      setError("찜할 클래스를 선택해 주세요.");
      return;
    }

    setError("");
    setMessage("");

    try {






      const result = await toggleOneDayWish(classId);
      const wished = result?.wished;
      setMessage(wished ? `클래스 #${classId} 찜 추가` : `클래스 #${classId} 찜 해제`);
      await loadWishes();
    } catch (e) {
      setError(e?.message ?? "찜 추가/해제 실패");


    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>찜 목록</h1>

        <div style={panel}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select style={{ ...input, minWidth: 260 }} value={selectedClassId} onChange={(e) => onSelectClass(e.target.value)}>
              <option value="">클래스 선택</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>#{c.id} {c.title}</option>
              ))}
            </select>

            <button style={btnPrimary} onClick={handleToggle}>찜 추가/해제</button>
            <button style={btnGhostButton} onClick={loadWishes} disabled={loading}>
              {loading ? "조회중..." : "찜 조회"}
            </button>
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {message && <div style={okBox}>{message}</div>}

        <div style={panel}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>찜 내역</h2>
          {wishes.length === 0 ? (
            <div style={{ color: "#6b7280" }}>찜 목록이 비어 있습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {wishes.map((item) => (
                <button
                  key={`${item.classProductId}-${item.wishedAt}`}
                  style={cardButton}
                  onClick={() => navigate(`/classes/oneday/classes/${item.classProductId}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <strong>{item.classTitle || `클래스 #${item.classProductId}`}</strong>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {slotStatusByClassId?.[Number(item.classProductId)]?.amCompleted ? <span style={closedBadge}>오전완료</span> : null}
                      {slotStatusByClassId?.[Number(item.classProductId)]?.pmCompleted ? <span style={closedBadge}>오후완료</span> : null}
                      {slotStatusByClassId?.[Number(item.classProductId)]?.amFull ? <span style={closedBadge}>오전마감</span> : null}
                      {slotStatusByClassId?.[Number(item.classProductId)]?.pmFull ? <span style={closedBadge}>오후마감</span> : null}
                    </div>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>
                    {item.wishedAt ? new Date(item.wishedAt).toLocaleString("ko-KR") : "-"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const input = {
  height: 38,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "0 10px",
  minWidth: 150,
};

const btnPrimary = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhostButton = {
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  cursor: "pointer",
};

const cardButton = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  display: "grid",
  gap: 4,
  background: "white",
  textAlign: "left",
  cursor: "pointer",
};

const closedBadge = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 700,
};

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
};

const okBox = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 10,
  padding: 10,
};
