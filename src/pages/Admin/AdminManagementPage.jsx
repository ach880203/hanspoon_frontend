import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUserList from "./AdminUserList";
import AdminPaymentList from "./AdminPaymentList";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminNoticeList from "./AdminNoticeList";
import AdminFaqList from "./AdminFaqList";
import AdminEventList from "./AdminEventList";
import { AdminReservationList } from "./AdminReservationList";
import AdminOneDayClassHub from "./AdminOneDayClassHub";
import AdminInquiryList from "./AdminInquiryList";
import AdminBannerManager from "./AdminBannerManager.jsx";
import AdminOrderManager from "./AdminOrderManager.jsx";
import "./AdminList.css";
import AdminRecipeHub from "./AdminRecipeHub.jsx";
import AdminProductHub from "./AdminProductHub.jsx";

const ADMIN_TAB_KEYS = [
  "dashboard",
  "users",
  "payments",
  "orders",
  "classes",
  "market",
  "recipe",
  "reservations",
  "cs",
];

const DEFAULT_ADMIN_TAB = "dashboard";

const AdminManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const tabFromQuery = searchParams.get("tab");
    return ADMIN_TAB_KEYS.includes(tabFromQuery) ? tabFromQuery : DEFAULT_ADMIN_TAB;
  }, [searchParams]);

  const handleTabChange = (nextTab) => {
    const safeNextTab = ADMIN_TAB_KEYS.includes(nextTab) ? nextTab : DEFAULT_ADMIN_TAB;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", safeNextTab);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboardPage onTabChange={handleTabChange} />;
      case "users":
        return <AdminUserList />;
      case "payments":
        return <AdminPaymentList />;
      case "orders":
        return <AdminOrderManager />;
      case "classes":
        // 핵심: 관리자 내부 전용 클래스 통합 관리 화면
        // 클래스/강사/클래스문의/클래스리뷰를 하위 탭으로 한 곳에서 운영합니다.
        return <AdminOneDayClassHub />;
      case "market":
        return <AdminProductHub />;
      case "reservations":
        return <AdminReservationList />;
      case "recipe":
        return <AdminRecipeHub />;
      case "cs":
        return (
          <div className="admin-cs-container">
            <h3>공지사항 관리</h3>
            <AdminNoticeList />
            <hr style={{ margin: "40px 0" }} />
            <h3>이벤트 관리</h3>
            <AdminEventList />
            <hr style={{ margin: "40px 0" }} />
            <h3>배너 관리</h3>
            <AdminBannerManager />
            <hr style={{ margin: "40px 0" }} />
            <h3>자주 묻는 질문 관리</h3>
            <AdminFaqList />
            <hr style={{ margin: "40px 0" }} />
            <h3>1:1 문의 관리</h3>
            <AdminInquiryList showOneDayTab={false} />
          </div>
        );
      default:
        return <AdminDashboardPage onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="admin-management-container">
      <div className="admin-tabs-nav" style={{ flexWrap: "wrap" }}>
        <button className={`admin-tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => handleTabChange("dashboard")}>
          대시보드
        </button>
        <button className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => handleTabChange("users")}>
          회원 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => handleTabChange("payments")}>
          결제 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => handleTabChange("orders")}>
          주문 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "classes" ? "active" : ""}`} onClick={() => handleTabChange("classes")}>
          클래스 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "market" ? "active" : ""}`} onClick={() => handleTabChange("market")}>
          상품 관리
        </button>
         <button className={`admin-tab-btn ${activeTab === "recipe" ? "active" : ""}`} onClick={() => handleTabChange("recipe")}>
           레시피 관리
         </button>
        <button className={`admin-tab-btn ${activeTab === "reservations" ? "active" : ""}`} onClick={() => handleTabChange("reservations")}>
          예약 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "cs" ? "active" : ""}`} onClick={() => handleTabChange("cs")}>
          게시판/CS
        </button>
      </div>

      <div className="admin-tab-content">{renderContent()}</div>
    </div>
  );
};

export default AdminManagementPage;

