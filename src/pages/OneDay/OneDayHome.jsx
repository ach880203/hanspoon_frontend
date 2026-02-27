import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOneDayClasses,
  getOneDayClassSessions,
  getOneDayHome,
  isSessionCompleted,
} from "../../api/onedayApi";
import { toCategoryLabel, toLevelLabel, toRunTypeLabel } from "./onedayLabels";
import { OneDayTopTabs } from "./OneDayTopTabs";

const PREVIEW_COUNT = 4;

export const OneDayHome = () => {
  const [data, setData] = useState({ eventClasses: [], alwaysClasses: [] });
  const [slotStatusByClassId, setSlotStatusByClassId] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const home = await getOneDayHome({ signal: controller.signal });
        setData({
          eventClasses: Array.isArray(home?.eventClasses) ? home.eventClasses : [],
          alwaysClasses: Array.isArray(home?.alwaysClasses) ? home.alwaysClasses : [],
        });
      } catch (homeErr) {
        if (homeErr?.name === "AbortError" || homeErr?.code === "ERR_CANCELED") return;

        try {
          const classes = await getOneDayClasses(
            { page: 0, size: 100, sort: "createdAt,desc" },
            { signal: controller.signal }
          );
          const list = Array.isArray(classes) ? classes : classes?.content ?? [];
          setData({
            eventClasses: list.filter((x) => x?.runType === "EVENT"),
            alwaysClasses: list.filter((x) => x?.runType === "ALWAYS"),
          });
        } catch (fallbackErr) {
          if (fallbackErr?.name === "AbortError" || fallbackErr?.code === "ERR_CANCELED") return;
          setError(fallbackErr?.message || homeErr?.message || "원데이 데이터를 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const toLatestOrder = (list) => {
    return [...list].sort((a, b) => {
      const aTime = Date.parse(a?.createdAt ?? "");
      const bTime = Date.parse(b?.createdAt ?? "");

      if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
        return bTime - aTime;
      }

      const aId = Number(a?.id ?? a?.classId ?? 0);
      const bId = Number(b?.id ?? b?.classId ?? 0);
      return bId - aId;
    });
  };

  const eventPreview = useMemo(
    () => toLatestOrder(data.eventClasses).slice(0, PREVIEW_COUNT),
    [data.eventClasses]
  );

  const alwaysPreview = useMemo(
    () => toLatestOrder(data.alwaysClasses).slice(0, PREVIEW_COUNT),
    [data.alwaysClasses]
  );

  useEffect(() => {
    let cancelled = false;

    const resolveSlotStatuses = async () => {
      const merged = [...eventPreview, ...alwaysPreview];
      const classIds = [...new Set(merged.map((x) => Number(x?.id ?? x?.classId ?? 0)).filter((x) => x > 0))];

      if (classIds.length === 0) {
        setSlotStatusByClassId({});
        return;
      }

      const checks = await Promise.all(
        classIds.map(async (classId) => {
          try {
            const sessions = await getOneDayClassSessions(classId);
            const list = Array.isArray(sessions) ? sessions : [];

            // 초보자 참고:
            // 홈에서도 목록과 동일하게 오전/오후를 분리해서 상태를 계산합니다.
            const amSessions = list.filter((s) => s?.slot === "AM");
            const pmSessions = list.filter((s) => s?.slot === "PM");

            const calc = (target) => {
              if (target.length === 0) return { completed: false, full: false };
              const completed = target.every((s) => isSessionCompleted(s?.startAt));
              if (completed) return { completed: true, full: false };

              const futureSessions = target.filter((s) => !isSessionCompleted(s?.startAt));
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
            return { classId, amCompleted: am.completed, pmCompleted: pm.completed, amFull: am.full, pmFull: pm.full };
          } catch {
            return { classId, amCompleted: false, pmCompleted: false, amFull: false, pmFull: false };
          }
        })
      );

      if (cancelled) return;

      const map = {};
      checks.forEach((x) => {
        map[x.classId] = x;
      });
      setSlotStatusByClassId(map);
    };

    resolveSlotStatuses();
    return () => {
      cancelled = true;
    };
  }, [alwaysPreview, eventPreview]);

  return (
    <div style={{ paddingBottom: 24 }}>
      <OneDayTopTabs />

      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 28 }}>원데이 클래스</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            최신 클래스를 빠르게 확인하고 예약할 수 있습니다.
          </p>
        </header>

        {error && <div style={errorBox}>{error}</div>}

        <ClassSection
          title="이벤트 클래스"
          loading={loading}
          items={eventPreview}
          slotStatusByClassId={slotStatusByClassId}
          emptyText="이벤트 클래스가 없습니다."
          moreLink="/classes/oneday/classes?runType=EVENT"
        />

        <ClassSection
          title="상시 클래스"
          loading={loading}
          items={alwaysPreview}
          slotStatusByClassId={slotStatusByClassId}
          emptyText="상시 클래스가 없습니다."
          moreLink="/classes/oneday/classes?runType=ALWAYS"
        />
      </div>
    </div>
  );
};

function ClassSection({ title, loading, items, slotStatusByClassId, emptyText, moreLink }) {
  return (
    <section style={panel}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      </div>

      {loading ? (
        <div style={{ color: "#6b7280" }}>불러오는 중...</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#6b7280" }}>{emptyText}</div>
      ) : (
        <div style={grid}>
          {items.map((item) => (
            <article key={item?.id} style={card}>
              <strong>{item?.title || "클래스"}</strong>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {slotStatusByClassId?.[Number(item?.id)]?.amCompleted ? <span style={statusBadge}>오전완료</span> : null}
                {slotStatusByClassId?.[Number(item?.id)]?.pmCompleted ? <span style={statusBadge}>오후완료</span> : null}
                {slotStatusByClassId?.[Number(item?.id)]?.amFull ? <span style={statusBadge}>오전마감</span> : null}
                {slotStatusByClassId?.[Number(item?.id)]?.pmFull ? <span style={statusBadge}>오후마감</span> : null}
                <span style={chip}>{item?.levelLabel || toLevelLabel(item?.level)}</span>
                <span style={chip}>{item?.categoryLabel || toCategoryLabel(item?.category)}</span>
                <span style={chip}>{item?.runTypeLabel || toRunTypeLabel(item?.runType)}</span>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <Link to={`/classes/oneday/classes/${item?.id}`} style={btnPrimary}>
                  상세 보기
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to={moreLink} style={btnGhost}>
          더보기
        </Link>
      </div>
    </section>
  );
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 10,
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  display: "grid",
  gap: 8,
  minHeight: 120,
};

const chip = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const statusBadge = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 700,
};

const btnPrimary = {
  height: 36,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const btnGhost = {
  height: 36,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const errorBox = {
  border: "1px solid #fecaca",
  background: "#fff1f2",
  color: "#991b1b",
  borderRadius: 10,
  padding: 10,
};