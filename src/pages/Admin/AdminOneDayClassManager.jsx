import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOneDayClass,
  deleteOneDayClass,
  getOneDayClassDetail,
  getOneDayClasses,
  getOneDayClassSessions,
  updateOneDayClass,
} from "../../api/onedayApi";
import { adminApi } from "../../api/adminApi";
import ClassLocationMap from "../OneDay/ClassLocationMap.jsx";
import { toCategoryLabel, toLevelLabel, toRunTypeLabel } from "../OneDay/onedayLabels";
import { toClassId, toClassSlotStatus, toDateMillis } from "../../utils/onedayClassUtils";
import "./AdminOneDayClassManager.css";

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_COUNT = 10;
const MAX_SESSION_COUNT = 120;
const ALWAYS_DEFAULT_SPAN_DAYS = 30;
const ALWAYS_MAX_RANGE_DAYS = 180;
const ALWAYS_PREVIEW_DATE_LIMIT = 12;
const CLASS_LIST_PAGE_SIZE = 6;
const WEEKDAY_OPTIONS = [
  { value: 1, label: "\uC6D4" },
  { value: 2, label: "\uD654" },
  { value: 3, label: "\uC218" },
  { value: 4, label: "\uBAA9" },
  { value: 5, label: "\uAE08" },
  { value: 6, label: "\uD1A0" },
  { value: 0, label: "\uC77C" },
];
const DEFAULT_ALWAYS_WEEKDAYS = WEEKDAY_OPTIONS.map((item) => item.value);
const LIST_RUN_TYPE_TABS = [
  { value: "ALWAYS", label: "\uC0C1\uC2DC \uC6B4\uC601" },
  { value: "EVENT", label: "\uC774\uBCA4\uD2B8" },
  { value: "ENDED", label: "\uC885\uB8CC \uD074\uB798\uC2A4" },
];

const EMPTY_FORM = buildEmptyForm();

export default function AdminOneDayClassManager() {
  const [mode, setMode] = useState("list"); // list | create | edit
  const [form, setForm] = useState(() => buildEmptyForm());
  const [mainImageName, setMainImageName] = useState("");
  const [detailImageNames, setDetailImageNames] = useState([]);
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [listRunTypeTab, setListRunTypeTab] = useState("ALWAYS");
  const [listPage, setListPage] = useState(0);
  const [classStatusByClassId, setClassStatusByClassId] = useState({});
  const [alwaysPreviewExpanded, setAlwaysPreviewExpanded] = useState(false);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const pageSize = 120;
      const firstPage = await getOneDayClasses({ page: 0, size: pageSize, sort: "createdAt,desc" });
      const firstList = Array.isArray(firstPage?.content) ? firstPage.content : Array.isArray(firstPage) ? firstPage : [];
      const totalPages = Number(firstPage?.totalPages ?? 1);

      if (totalPages <= 1) {
        setClasses(firstList);
        return;
      }

      const remainIndexes = Array.from({ length: totalPages - 1 }, (_, index) => index + 1);
      const remainPages = await Promise.all(
        remainIndexes.map((pageIndex) => getOneDayClasses({ page: pageIndex, size: pageSize, sort: "createdAt,desc" }))
      );
      const merged = [...firstList];
      remainPages.forEach((pageData) => {
        const list = Array.isArray(pageData?.content) ? pageData.content : Array.isArray(pageData) ? pageData : [];
        merged.push(...list);
      });
      setClasses(merged);
    } catch (e) {
      setError(e?.message ?? "클래스 목록을 불러오지 못했습니다.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    let cancelled = false;

    const resolveClassStatus = async () => {
      const classIds = [...new Set(classes.map((item) => toClassId(item)).filter((id) => id > 0))];
      if (classIds.length === 0) {
        setClassStatusByClassId({});
        return;
      }

      // 운영/종료 상태 기준을 사용자 화면과 동일하게 맞추기 위해 공통 상태 계산을 사용합니다.
      // 이렇게 맞춰두면 "관리자에서는 운영 중, 사용자에서는 종료" 같은 상태 불일치를 줄일 수 있습니다.
      const results = await Promise.all(
        classIds.map(async (classId) => {
          try {
            const sessions = await getOneDayClassSessions(classId);
            const status = toClassSlotStatus(sessions);
            return { classId, ...status };
          } catch {
            return {
              classId,
              hasSessions: false,
              classEnded: false,
              amCompleted: false,
              pmCompleted: false,
              amFull: false,
              pmFull: false,
            };
          }
        })
      );

      if (cancelled) return;

      const nextMap = {};
      results.forEach((item) => {
        nextMap[item.classId] = item;
      });
      setClassStatusByClassId(nextMap);
    };

    resolveClassStatus();
    return () => {
      cancelled = true;
    };
  }, [classes]);

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const res = await adminApi.getOneDayInstructors();
        setInstructors(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setInstructors([]);
      }
    };
    loadInstructors();
  }, []);

  const classRunTypeCounts = useMemo(
    () => ({
      ALWAYS: classes.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "ALWAYS" && !status?.classEnded;
      }).length,
      EVENT: classes.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "EVENT" && !status?.classEnded;
      }).length,
      ENDED: classes.filter((item) => classStatusByClassId[toClassId(item)]?.classEnded).length,
    }),
    [classes, classStatusByClassId]
  );

  const visibleClasses = useMemo(() => {
    let filtered = classes;

    if (listRunTypeTab === "ENDED") {
      filtered = classes.filter((item) => classStatusByClassId[toClassId(item)]?.classEnded);
    } else if (listRunTypeTab === "ALWAYS") {
      filtered = classes.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "ALWAYS" && !status?.classEnded;
      });
    } else if (listRunTypeTab === "EVENT") {
      filtered = classes.filter((item) => {
        const status = classStatusByClassId[toClassId(item)];
        return item?.runType === "EVENT" && !status?.classEnded;
      });
    }

    return [...filtered].sort((left, right) => {
      const leftCreatedAt = toDateMillis(left?.createdAt);
      const rightCreatedAt = toDateMillis(right?.createdAt);
      if (leftCreatedAt !== rightCreatedAt) return rightCreatedAt - leftCreatedAt;
      return toClassId(right) - toClassId(left);
    });
  }, [classes, classStatusByClassId, listRunTypeTab]);

  const listTotalPages = Math.max(1, Math.ceil(visibleClasses.length / CLASS_LIST_PAGE_SIZE));
  const currentListPage = Math.min(listPage, listTotalPages - 1);
  const pagedClasses = useMemo(() => {
    const start = currentListPage * CLASS_LIST_PAGE_SIZE;
    return visibleClasses.slice(start, start + CLASS_LIST_PAGE_SIZE);
  }, [visibleClasses, currentListPage]);

  useEffect(() => {
    setListPage(0);
  }, [listRunTypeTab]);

  useEffect(() => {
    if (listPage > listTotalPages - 1) {
      setListPage(Math.max(listTotalPages - 1, 0));
    }
  }, [listPage, listTotalPages]);

  const alwaysPreviewSessions = useMemo(() => {
    if (mode !== "create" || form.runType !== "ALWAYS") return [];
    return buildAlwaysSessions(
      buildAlwaysTemplateRows(form.sessions),
      form.alwaysStartDate,
      form.alwaysEndDate,
      form.alwaysWeekdays
    );
  }, [mode, form.runType, form.sessions, form.alwaysStartDate, form.alwaysEndDate, form.alwaysWeekdays]);

  const alwaysPreviewDays = useMemo(() => groupSessionsByDate(alwaysPreviewSessions), [alwaysPreviewSessions]);
  const visibleAlwaysPreviewDays = alwaysPreviewExpanded
    ? alwaysPreviewDays
    : alwaysPreviewDays.slice(0, ALWAYS_PREVIEW_DATE_LIMIT);
  const hiddenAlwaysPreviewDayCount = Math.max(alwaysPreviewDays.length - visibleAlwaysPreviewDays.length, 0);

  useEffect(() => {
    if (mode === "create" && form.runType === "ALWAYS") {
      setAlwaysPreviewExpanded(false);
    }
  }, [mode, form.runType, form.alwaysStartDate, form.alwaysEndDate, form.alwaysWeekdays, form.sessions]);

  const openCreate = () => {
    const alwaysDefaults = buildAlwaysPeriodDefaults();
    setMode("create");
    setForm({
      ...buildEmptyForm(),
      alwaysStartDate: alwaysDefaults.startDate,
      alwaysEndDate: alwaysDefaults.endDate,
      alwaysWeekdays: [...DEFAULT_ALWAYS_WEEKDAYS],
      sessions: buildAlwaysTemplateRows([]),
    });
    setAlwaysPreviewExpanded(false);
    setMainImageName("");
    setDetailImageNames([]);
    setError("");
    setMessage("");
  };

  const openEdit = async (classId) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [detail, sessions] = await Promise.all([getOneDayClassDetail(classId), getOneDayClassSessions(classId)]);

      const normalizedSessions = (Array.isArray(sessions) ? sessions : []).map((session) => ({
        startAt: toDatetimeLocal(session.startAt),
        slot: session.slot || "AM",
        capacity: String(session.capacity ?? 10),
        price: String(session.price ?? 0),
      }));

      const detailImagesRaw = Array.isArray(detail?.detailImageDataList)
        ? detail.detailImageDataList.filter((x) => typeof x === "string" && x.length > 0)
        : detail?.detailImageData
        ? [detail.detailImageData]
        : [];
      const mainImageData = detail?.detailImageData || detailImagesRaw[0] || "";
      const detailImages = detailImagesRaw.filter((x, index) => !(index === 0 && x === mainImageData));
      const alwaysDefaults = buildAlwaysPeriodDefaults();

      setForm({
        id: detail?.id ?? classId,
        title: detail?.title ?? "",
        description: detail?.description ?? "",
        detailDescription: detail?.detailDescription ?? "",
        mainImageData,
        detailImageDataList: detailImages,
        level: detail?.level ?? "BEGINNER",
        runType: detail?.runType ?? "ALWAYS",
        category: detail?.category ?? "KOREAN",
        instructorId: String(detail?.instructorId ?? ""),
        locationAddress: detail?.locationAddress ?? "",
        locationLat: detail?.locationLat ?? null,
        locationLng: detail?.locationLng ?? null,
        alwaysStartDate: alwaysDefaults.startDate,
        alwaysEndDate: alwaysDefaults.endDate,
        alwaysWeekdays: [...DEFAULT_ALWAYS_WEEKDAYS],
        sessions: normalizedSessions.length > 0 ? normalizedSessions : buildEmptyForm().sessions,
      });
      setMainImageName(mainImageData ? "기존 메인 이미지" : "");
      setDetailImageNames(detailImages.map((_, index) => `기존 상세 이미지 ${index + 1}`));
      setMode("edit");
    } catch (e) {
      setError(e?.message ?? "클래스 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowOpenEdit = (classId) => {
    if (loading || submitting) return;
    openEdit(classId);
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleRunTypeChange = (nextRunType) => {
    if (mode !== "create") {
      setField("runType", nextRunType);
      return;
    }

    // 등록 화면에서 상시(ALWAYS)로 바꾸면 오전/오후 템플릿 2개를 기준으로 입력값을 고정합니다.
    if (nextRunType === "ALWAYS") {
      setForm((prev) => ({
        ...prev,
        runType: "ALWAYS",
        sessions: buildAlwaysTemplateRows(prev.sessions),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      runType: nextRunType,
      sessions: prev.sessions.map((row) => ({
        ...row,
        startAt: toDatetimeLocalFromTime(extractTimeOrFallback(row?.startAt, row?.slot === "AM" ? "10:00" : "15:00")),
      })),
    }));
  };

  const setAlwaysSessionField = (slot, name, value) => {
    setForm((prev) => {
      const templateRows = buildAlwaysTemplateRows(prev.sessions).map((row) =>
        row.slot === slot ? { ...row, [name]: value } : row
      );
      return { ...prev, sessions: templateRows };
    });
  };

  const toggleAlwaysWeekday = (weekdayValue) => {
    setForm((prev) => {
      const current = normalizeWeekdays(prev.alwaysWeekdays);
      const next = current.includes(weekdayValue)
        ? current.filter((value) => value !== weekdayValue)
        : [...current, weekdayValue];
      return { ...prev, alwaysWeekdays: normalizeWeekdays(next) };
    });
  };

  const setAlwaysWeekdayPreset = (preset) => {
    if (preset === "weekday") {
      setField("alwaysWeekdays", [1, 2, 3, 4, 5]);
      return;
    }
    if (preset === "weekend") {
      setField("alwaysWeekdays", [6, 0]);
      return;
    }
    setField("alwaysWeekdays", [...DEFAULT_ALWAYS_WEEKDAYS]);
  };

  const setSessionField = (index, name, value) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    }));
  };

  const addSession = () => {
    setForm((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { startAt: "", slot: "PM", capacity: "10", price: "50000" }],
    }));
  };

  const removeSession = (index) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.length <= 1 ? prev.sessions : prev.sessions.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => {
    const instructorId = Number(form.instructorId);
    const detailImageDataList = Array.isArray(form.detailImageDataList) ? form.detailImageDataList : [];
    // 상시 등록은 선택한 기간/요일에 따라 세션 배열을 펼쳐 서버 DTO 형식(초 포함 ISO 문자열)으로 변환합니다.
    const sessions =
      mode === "create" && form.runType === "ALWAYS"
        ? buildAlwaysSessions(
            buildAlwaysTemplateRows(form.sessions),
            form.alwaysStartDate,
            form.alwaysEndDate,
            form.alwaysWeekdays
          )
        : form.sessions.map((row) => ({
            startAt: toIsoWithSeconds(row.startAt),
            slot: row.slot,
            capacity: Number(row.capacity),
            price: Number(row.price),
          }));

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      detailDescription: form.detailDescription.trim(),
      detailImageData: form.mainImageData || "",
      detailImageDataList,
      level: form.level,
      runType: form.runType,
      category: form.category,
      instructorId: Number.isInteger(instructorId) && instructorId > 0 ? instructorId : null,
      locationAddress: form.locationAddress?.trim() || "",
      locationLat: form.locationLat,
      locationLng: form.locationLng,
      sessions,
    };
  };

  const validate = (payload) => {
    if (!payload.title) return "클래스 제목을 입력해 주세요.";
    if (!payload.description) return "요약 설명을 입력해 주세요.";
    if (!payload.detailDescription) return "상세 설명을 입력해 주세요.";
    if (!payload.instructorId) return "강사를 선택해 주세요.";
    if (mode === "create" && form.runType === "ALWAYS") {
      const startDate = parseDateOnly(form.alwaysStartDate);
      const endDate = parseDateOnly(form.alwaysEndDate);
      if (!startDate || !endDate) return "상시 클래스의 시작일/종료일을 모두 선택해 주세요.";
      if (endDate < startDate) return "종료일은 시작일보다 이전일 수 없습니다.";

      const rangeDays = diffInclusiveDays(startDate, endDate);
      if (rangeDays > ALWAYS_MAX_RANGE_DAYS) {
        return `상시 클래스 운영 기간은 최대 ${ALWAYS_MAX_RANGE_DAYS}일까지 설정할 수 있습니다.`;
      }

      if (!Array.isArray(form.alwaysWeekdays) || form.alwaysWeekdays.length === 0) {
        return "상시 클래스는 최소 1개 요일을 선택해 주세요.";
      }
      // 상시 템플릿은 시간(HH:MM)만 입력받기 때문에 datetime-local 검증 대신 시간 문자열 검증을 사용합니다.
      const alwaysRows = buildAlwaysTemplateRows(form.sessions);
      if (!alwaysRows.every((row) => isTimeString(row.startAt))) {
        return "상시 클래스의 오전/오후 시간은 HH:MM 형식으로 입력해 주세요.";
      }
    }
    if (!Array.isArray(payload.sessions) || payload.sessions.length === 0) return "세션은 최소 1개가 필요합니다.";
    if (payload.sessions.length > MAX_SESSION_COUNT) {
      return `생성 가능한 세션은 최대 ${MAX_SESSION_COUNT}개입니다. 기간을 줄이거나 요일을 조정해 주세요.`;
    }
    if ((payload.detailImageDataList?.length ?? 0) > MAX_IMAGE_COUNT) {
      return `상세 이미지는 최대 ${MAX_IMAGE_COUNT}개까지 등록할 수 있습니다.`;
    }

    for (let i = 0; i < payload.sessions.length; i += 1) {
      const row = payload.sessions[i];
      const prefix = `세션 ${i + 1}`;
      if (!row.startAt) return `${prefix} 시작일시를 입력해 주세요.`;
      if (!row.slot) return `${prefix} 시간대를 선택해 주세요.`;
      if (!Number.isInteger(row.capacity) || row.capacity <= 0) return `${prefix} 정원은 1 이상이어야 합니다.`;
      if (!Number.isInteger(row.price) || row.price < 0) return `${prefix} 가격은 0 이상이어야 합니다.`;
    }
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const payload = buildPayload();
    const validationError = validate(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createOneDayClass(payload);
        setMessage("클래스가 등록되었습니다.");
      } else {
        await updateOneDayClass(form.id, payload);
        setMessage("클래스가 수정되었습니다.");
      }

      await loadClasses();
      setMode("list");
      setForm(buildEmptyForm());
      setAlwaysPreviewExpanded(false);
      setMainImageName("");
      setDetailImageNames([]);
    } catch (e) {
      setError(e?.message ?? "요청 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeClass = async (classId) => {
    if (!window.confirm("클래스를 삭제하시겠습니까? 예약 이력이 있으면 삭제할 수 없습니다.")) return;
    setError("");
    setMessage("");
    try {
      await deleteOneDayClass(classId);
      setMessage("클래스가 삭제되었습니다.");
      await loadClasses();
    } catch (e) {
      setError(e?.message ?? "클래스 삭제에 실패했습니다.");
    }
  };

  const handleImageFiles = async (event) => {
    setError("");
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remain = MAX_IMAGE_COUNT - form.detailImageDataList.length;
    if (remain <= 0) {
      setError(`상세 이미지는 최대 ${MAX_IMAGE_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }

    const limited = files.slice(0, remain);
    const nextImages = [];
    const nextNames = [];

    for (const file of limited) {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError("이미지 파일은 50MB 이하만 업로드할 수 있습니다.");
        return;
      }
      nextImages.push(await readFileAsDataUrl(file));
      nextNames.push(file.name);
    }

    setForm((prev) => ({
      ...prev,
      detailImageDataList: [...prev.detailImageDataList, ...nextImages],
    }));
    setDetailImageNames((prev) => [...prev, ...nextNames]);
    event.target.value = "";
  };

  const handleMainImageFile = async (event) => {
    setError("");
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("이미지 파일은 50MB 이하만 업로드할 수 있습니다.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, mainImageData: dataUrl }));
    setMainImageName(file.name);
    event.target.value = "";
  };

  const removeDetailImage = (index) => {
    setForm((prev) => ({
      ...prev,
      detailImageDataList: prev.detailImageDataList.filter((_, i) => i !== index),
    }));
    setDetailImageNames((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setForm((prev) => ({ ...prev, mainImageData: "" }));
    setMainImageName("");
  };

  return (
    <div className="admin-oneday-wrap">
      <div className="admin-oneday-head">
        <div>
          <h2>원데이 클래스 관리</h2>
          <p>관리자 페이지 안에서 클래스 등록/조회/수정/삭제를 모두 처리할 수 있습니다.</p>
        </div>
        <div className="admin-oneday-head-actions">
          <button className="btn-ghost" onClick={loadClasses} disabled={loading}>
            {loading ? "불러오는 중.." : "전체 클래스 새로고침"}
          </button>
          <button className="btn-primary" onClick={openCreate}>
            클래스 등록
          </button>
        </div>
      </div>

      {error ? <div className="msg-box msg-error">{error}</div> : null}
      {message ? <div className="msg-box msg-ok">{message}</div> : null}

      <div className="admin-oneday-grid">
        <section className="admin-oneday-panel">
          <h3>클래스 리스트</h3>
          <div className="admin-class-tabs">
            {LIST_RUN_TYPE_TABS.map((tab) => {
              const count =
                tab.value === "ALWAYS"
                  ? classRunTypeCounts.ALWAYS
                  : tab.value === "EVENT"
                  ? classRunTypeCounts.EVENT
                  : classRunTypeCounts.ENDED;

              return (
                <button
                  key={`admin-class-tab-${tab.value}`}
                  type="button"
                  className={listRunTypeTab === tab.value ? "admin-class-tab is-active" : "admin-class-tab"}
                  onClick={() => setListRunTypeTab(tab.value)}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
          {visibleClasses.length === 0 ? (
            <div className="muted">등록된 클래스가 없습니다.</div>
          ) : (
            <>
              <div className="class-list">
              {pagedClasses.map((item) => {
                const classStatus = classStatusByClassId[toClassId(item)];

                return (
                  <article
                    key={item.id}
                    className={`class-row ${mode === "edit" && Number(form.id) === Number(item.id) ? "is-active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowOpenEdit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowOpenEdit(item.id);
                      }
                    }}
                  >
                    <div className="class-row-thumb-wrap">
                      {item?.mainImageData ? (
                        <img
                          className="class-row-thumb"
                          src={item.mainImageData}
                          alt={`${item.title || `클래스 #${item.id}`} 메인 이미지`}
                        />
                      ) : (
                        <div className="class-row-thumb class-row-thumb-empty">이미지 없음</div>
                      )}
                    </div>
                    <div className="class-row-main">
                      <strong>{item.title || `클래스 #${item.id}`}</strong>
                      <div className="class-row-meta">
                        <span>{toLevelLabel(item.level)}</span>
                        <span>{toRunTypeLabel(item.runType)}</span>
                        <span>{toCategoryLabel(item.category)}</span>
                        <span>강사: {item.instructorName || "-"} (ID: {item.instructorId ?? "-"})</span>
                      </div>
                      <div className="class-row-status">
                        {classStatus?.amCompleted ? <span className="class-status-chip">오전 완료</span> : null}
                        {classStatus?.pmCompleted ? <span className="class-status-chip">오후 완료</span> : null}
                        {classStatus?.amFull ? <span className="class-status-chip">오전 마감</span> : null}
                        {classStatus?.pmFull ? <span className="class-status-chip">오후 마감</span> : null}
                        {classStatus?.classEnded ? (
                          <span className="class-status-chip is-ended">종료 클래스</span>
                        ) : classStatus?.hasSessions ? (
                          <span className="class-status-chip is-open">운영 중</span>
                        ) : (
                          <span className="class-status-chip">상태 확인중</span>
                        )}
                      </div>
                    </div>
                    <div className="class-row-actions">
                      <button
                        className="btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          openEdit(item.id);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeClass(item.id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                );
              })}
              </div>
              <div className="class-list-pagination">
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={currentListPage <= 0}
                  onClick={() => setListPage((prev) => Math.max(prev - 1, 0))}
                >
                  이전
                </button>
                <span>
                  {currentListPage + 1} / {listTotalPages} 페이지
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={currentListPage >= listTotalPages - 1}
                  onClick={() => setListPage((prev) => Math.min(prev + 1, listTotalPages - 1))}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </section>

        <section className="admin-oneday-panel">
          <h3>{mode === "create" ? "클래스 등록" : mode === "edit" ? `클래스 수정 #${form.id}` : "입력 대기"}</h3>
          {mode === "list" ? (
            <div className="muted">왼쪽 목록에서 수정할 클래스를 선택하거나, "클래스 등록" 버튼을 눌러 주세요.</div>
          ) : (
            <form className="class-form" onSubmit={submit}>
              <label>
                <span>클래스 제목</span>
                <input value={form.title} onChange={(e) => setField("title", e.target.value)} maxLength={80} />
              </label>

              <label>
                <span>요약 설명</span>
                <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </label>

              <label>
                <span>상세 설명</span>
                <textarea
                  className="detail-textarea"
                  value={form.detailDescription}
                  onChange={(e) => setField("detailDescription", e.target.value)}
                />
              </label>

              <div>
                <span>클래스 위치(지도 선택)</span>
                <ClassLocationMap
                  value={{
                    address: form.locationAddress,
                    lat: form.locationLat,
                    lng: form.locationLng,
                  }}
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      locationAddress: v.address,
                      locationLat: v.lat,
                      locationLng: v.lng,
                    }))
                  }
                />
              </div>

              <label>
                <span>메인 사진 (리스트 썸네일)</span>
                <input type="file" accept="image/*" onChange={handleMainImageFile} />
              </label>
              <div className="selected-file-box">{mainImageName ? `선택된 파일: ${mainImageName}` : "선택된 파일 없음"}</div>
              {form.mainImageData ? (
                <div className="preview-wrap">
                  <div className="preview-grid">
                    <div className="preview-item">
                      <img src={form.mainImageData} alt="메인 이미지 미리보기" />
                      <button type="button" className="btn-danger" onClick={removeMainImage}>
                        메인 이미지 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <label>
                <span>상세 이미지 (여러 장)</span>
                <input type="file" accept="image/*" multiple onChange={handleImageFiles} />
              </label>
              <div className="selected-file-box">
                {detailImageNames.length > 0 ? `선택된 파일: ${detailImageNames.join(", ")}` : "선택된 파일 없음"}
              </div>
              {form.detailImageDataList.length > 0 ? (
                <div className="preview-wrap">
                  <div className="preview-grid">
                    {form.detailImageDataList.map((img, index) => (
                      <div key={`detail-img-${index}`} className="preview-item">
                        <img src={img} alt={`상세 이미지 ${index + 1}`} />
                        <button type="button" className="btn-danger" onClick={() => removeDetailImage(index)}>
                          이미지 삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="class-form-grid">
                <label>
                  <span>강사 선택</span>
                  <select value={form.instructorId} onChange={(e) => setField("instructorId", e.target.value)}>
                    <option value="">강사 선택</option>
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.userName} ({inst.specialty || "전문분야 미입력"})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>난이도</span>
                  <select value={form.level} onChange={(e) => setField("level", e.target.value)}>
                    <option value="BEGINNER">입문</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="ADVANCED">고급</option>
                  </select>
                </label>

                <label>
                  <span>운영 유형</span>
                  <select value={form.runType} onChange={(e) => handleRunTypeChange(e.target.value)}>
                    <option value="ALWAYS">상시</option>
                    <option value="EVENT">이벤트</option>
                  </select>
                </label>

                <label>
                  <span>카테고리</span>
                  <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
                    <option value="KOREAN">한식</option>
                    <option value="BAKERY">베이커리</option>
                  </select>
                </label>
              </div>

              {mode === "create" && form.runType === "ALWAYS" ? (
                <div className="always-config-box">
                  <strong>상시 운영 자동 생성 조건</strong>
                  <div className="class-form-grid always-date-grid">
                    <label>
                      <span>운영 시작일</span>
                      <input type="date" value={form.alwaysStartDate} onChange={(e) => setField("alwaysStartDate", e.target.value)} />
                    </label>
                    <label>
                      <span>운영 종료일</span>
                      <input type="date" value={form.alwaysEndDate} onChange={(e) => setField("alwaysEndDate", e.target.value)} />
                    </label>
                  </div>

                  <div className="weekday-toolbar">
                    <span>운영 요일</span>
                    <div className="weekday-preset-buttons">
                      <button type="button" className="btn-ghost" onClick={() => setAlwaysWeekdayPreset("all")}>
                        전체
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setAlwaysWeekdayPreset("weekday")}>
                        평일
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setAlwaysWeekdayPreset("weekend")}>
                        주말
                      </button>
                    </div>
                  </div>

                  <div className="weekday-toggle-group">
                    {WEEKDAY_OPTIONS.map((weekday) => {
                      const selected = normalizeWeekdays(form.alwaysWeekdays).includes(weekday.value);
                      return (
                        <button
                          key={`always-weekday-${weekday.value}`}
                          type="button"
                          className={selected ? "weekday-toggle is-active" : "weekday-toggle"}
                          onClick={() => toggleAlwaysWeekday(weekday.value)}
                        >
                          {weekday.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="muted">시작일~종료일 사이에서 선택한 요일의 오전/오후 세션을 자동 생성합니다.</p>
                </div>
              ) : null}

              {mode === "create" && form.runType === "ALWAYS" ? (
                <>
                  <div className="session-list">
                    {buildAlwaysTemplateRows(form.sessions).map((session) => (
                      <article key={`always-session-${session.slot}`} className="session-row">
                        <div className="session-row-head">
                          <strong>{session.slot === "AM" ? "오전 세션 템플릿" : "오후 세션 템플릿"}</strong>
                        </div>
                        <div className="session-grid">
                          <label>
                            <span>시간</span>
                            <input
                              type="time"
                              value={session.startAt}
                              onChange={(e) => setAlwaysSessionField(session.slot, "startAt", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>정원</span>
                            <input
                              type="number"
                              min="1"
                              value={session.capacity}
                              onChange={(e) => setAlwaysSessionField(session.slot, "capacity", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>가격</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={session.price}
                              onChange={(e) => setAlwaysSessionField(session.slot, "price", e.target.value)}
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="always-preview-box">
                    <div className="always-preview-head">
                      <strong>자동 생성 미리보기</strong>
                      <span>
                        날짜 {alwaysPreviewDays.length}일 / 세션 {alwaysPreviewSessions.length}개
                      </span>
                    </div>
                    {alwaysPreviewDays.length === 0 ? (
                      <p className="muted">선택한 조건으로 생성 가능한 세션이 없습니다. 기간/요일/시간을 확인해 주세요.</p>
                    ) : (
                      <>
                        <div className="always-preview-day-grid">
                          {visibleAlwaysPreviewDays.map((day) => (
                            <article key={`always-preview-${day.date}`} className="always-preview-day-card">
                              <div className="always-preview-day-head">
                                <strong>{toKoreanDateLabel(day.date)}</strong>
                                <span>{day.sessions.length}개</span>
                              </div>
                              <ul className="always-preview-slot-list">
                                {day.sessions.map((session, index) => (
                                  <li key={`always-preview-item-${day.date}-${index}`}>
                                    {session.slot === "AM" ? "오전" : "오후"} {toHourMinute(session.startAt)} · 정원 {session.capacity}명 ·{" "}
                                    {Number(session.price || 0).toLocaleString()}원
                                  </li>
                                ))}
                              </ul>
                            </article>
                          ))}
                        </div>
                        {hiddenAlwaysPreviewDayCount > 0 ? (
                          <div className="always-preview-more">
                            <button type="button" className="btn-ghost" onClick={() => setAlwaysPreviewExpanded((prev) => !prev)}>
                              {alwaysPreviewExpanded
                                ? "미리보기 접기"
                                : `날짜 ${hiddenAlwaysPreviewDayCount}일 더 보기`}
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="session-head">
                    <strong>세션 목록</strong>
                    <button type="button" className="btn-ghost" onClick={addSession}>
                      세션 추가
                    </button>
                  </div>

                  <div className="session-list">
                    {form.sessions.map((session, index) => (
                      <article key={`session-${index}`} className="session-row">
                        <div className="session-row-head">
                          <strong>세션 {index + 1}</strong>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => removeSession(index)}
                            disabled={form.sessions.length <= 1}
                          >
                            삭제
                          </button>
                        </div>
                        <div className="session-grid">
                          <label>
                            <span>시작일시</span>
                            <input
                              type="datetime-local"
                              value={session.startAt}
                              onChange={(e) => setSessionField(index, "startAt", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>시간대</span>
                            <select value={session.slot} onChange={(e) => setSessionField(index, "slot", e.target.value)}>
                              <option value="AM">오전</option>
                              <option value="PM">오후</option>
                            </select>
                          </label>
                          <label>
                            <span>정원</span>
                            <input
                              type="number"
                              min="1"
                              value={session.capacity}
                              onChange={(e) => setSessionField(index, "capacity", e.target.value)}
                            />
                          </label>
                          <label>
                            <span>가격</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={session.price}
                              onChange={(e) => setSessionField(index, "price", e.target.value)}
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "처리 중.." : mode === "create" ? "등록하기" : "수정 완료"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setMode("list");
                    setForm(buildEmptyForm());
                    setAlwaysPreviewExpanded(false);
                    setMainImageName("");
                    setDetailImageNames([]);
                    setError("");
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function todayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildAlwaysPeriodDefaults() {
  const startDate = todayDateString();
  const endDate = addDaysToDateString(startDate, ALWAYS_DEFAULT_SPAN_DAYS - 1);
  return { startDate, endDate };
}

function buildEmptyForm() {
  const alwaysDefaults = buildAlwaysPeriodDefaults();
  return {
    id: null,
    title: "",
    description: "",
    detailDescription: "",
    mainImageData: "",
    detailImageDataList: [],
    level: "BEGINNER",
    runType: "ALWAYS",
    category: "KOREAN",
    instructorId: "",
    locationAddress: "",
    locationLat: null,
    locationLng: null,
    alwaysStartDate: alwaysDefaults.startDate,
    alwaysEndDate: alwaysDefaults.endDate,
    alwaysWeekdays: [...DEFAULT_ALWAYS_WEEKDAYS],
    sessions: [
      { startAt: "10:00", slot: "AM", capacity: "10", price: "50000" },
      { startAt: "15:00", slot: "PM", capacity: "10", price: "50000" },
    ],
  };
}

function addDaysToDateString(dateString, days) {
  const base = parseDateOnly(dateString);
  if (!base) return dateString;
  base.setDate(base.getDate() + days);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeWeekdays(values) {
  const orderedValues = WEEKDAY_OPTIONS.map((item) => item.value);
  const unique = new Set(Array.isArray(values) ? values.map((value) => Number(value)) : []);
  return orderedValues.filter((value) => unique.has(value));
}

function parseDateOnly(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function diffInclusiveDays(startDate, endDate) {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return 0;
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

function groupSessionsByDate(sessions) {
  const map = new Map();
  (Array.isArray(sessions) ? sessions : []).forEach((session) => {
    const iso = String(session?.startAt || "");
    const dateKey = iso.slice(0, 10);
    if (!dateKey) return;
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey).push(session);
  });

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, daySessions]) => ({
      date,
      sessions: [...daySessions].sort((a, b) => String(a.startAt || "").localeCompare(String(b.startAt || ""))),
    }));
}

function toKoreanDateLabel(dateKey) {
  const date = parseDateOnly(dateKey);
  if (!date) return dateKey;
  const weekday = WEEKDAY_OPTIONS.find((item) => item.value === date.getDay())?.label ?? "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day} (${weekday})`;
}

function toHourMinute(value) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(11, 16) || "--:--";
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function buildAlwaysSessions(templateRows, startDate, endDate, weekdays) {
  const rows = Array.isArray(templateRows) ? templateRows : [];
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const allowedWeekdays = new Set(normalizeWeekdays(weekdays));
  if (!start || !end || start > end || allowedWeekdays.size === 0) return [];

  const now = new Date();
  const result = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (!allowedWeekdays.has(cursor.getDay())) continue;

    rows.forEach((row) => {
      if (!row?.startAt) return;
      const time = toTimeParts(row.startAt);
      if (!time) return;

      const sessionDate = new Date(cursor);
      sessionDate.setHours(time.hour, time.minute, 0, 0);
      // 이미 지난 시각은 생성하지 않아 "생성 직후 과거 세션" 문제를 막습니다.
      if (sessionDate < now) return;

      const year = sessionDate.getFullYear();
      const month = String(sessionDate.getMonth() + 1).padStart(2, "0");
      const day = String(sessionDate.getDate()).padStart(2, "0");
      const hour = String(sessionDate.getHours()).padStart(2, "0");
      const minute = String(sessionDate.getMinutes()).padStart(2, "0");

      result.push({
        startAt: `${year}-${month}-${day}T${hour}:${minute}:00`,
        slot: row.slot,
        capacity: Number(row.capacity),
        price: Number(row.price),
      });
    });
  }

  return result;
}

function buildAlwaysTemplateRows(sourceRows) {
  const rows = Array.isArray(sourceRows) ? sourceRows : [];
  const amSource = rows.find((row) => row?.slot === "AM");
  const pmSource = rows.find((row) => row?.slot === "PM");
  return [
    {
      slot: "AM",
      startAt: extractTimeOrFallback(amSource?.startAt, "10:00"),
      capacity: String(amSource?.capacity ?? "10"),
      price: String(amSource?.price ?? "50000"),
    },
    {
      slot: "PM",
      startAt: extractTimeOrFallback(pmSource?.startAt, "15:00"),
      capacity: String(pmSource?.capacity ?? "10"),
      price: String(pmSource?.price ?? "50000"),
    },
  ];
}

function extractTimeOrFallback(value, fallback) {
  const time = toTimeParts(value);
  if (!time) return fallback;
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

function toTimeParts(value) {
  if (!value) return null;
  const timeMatch = String(value).match(/^(\d{2}):(\d{2})$/);
  if (timeMatch) {
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return { hour: parsed.getHours(), minute: parsed.getMinutes() };
}

function isTimeString(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
}

function toIsoWithSeconds(value) {
  if (!value) return "";
  // datetime-local 입력은 초 단위가 없는 경우가 있어 서버 포맷과 맞추기 위해 :00을 보정합니다.
  return value.length === 16 ? `${value}:00` : value;
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDatetimeLocalFromTime(timeValue) {
  const time = toTimeParts(timeValue);
  if (!time) return "";
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("이미지를 읽어오지 못했습니다."));
    reader.readAsDataURL(file);
  });
}


