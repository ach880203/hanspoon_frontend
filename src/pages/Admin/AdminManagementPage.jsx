import { useState } from "react";
import AdminUserList from "./AdminUserList";
import AdminPaymentList from "./AdminPaymentList";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminNoticeList from "./AdminNoticeList";
import AdminFaqList from "./AdminFaqList";
import { AdminReservationList } from "./AdminReservationList";
import AdminOneDayClassManager from "./AdminOneDayClassManager";
import AdminInquiryList from "./AdminInquiryList";
import AdminOneDayInstructorManager from "./AdminOneDayInstructorManager";
import "./AdminList.css";

const AdminManagementPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboardPage />;
      case "users":
        return <AdminUserList />;
      case "payments":
        return <AdminPaymentList />;
      case "classes":
        // 핵심: 관리자 내부 전용 클래스 관리 화면
        // 기존처럼 공용 OneDay 페이지로 이동하지 않고, 현재 관리자 탭 안에서만 동작합니다.
        return <AdminOneDayClassManager />;
      case "instructors":
        return <AdminOneDayInstructorManager />;
      case "market":
        return <AdminInquiryList />; // 상품 관리 탭에서도 문의를 볼 수 있도록 하거나, 아래 CS 탭에서 통합 관리
      case "reservations":
        return <AdminReservationList />;
      case "cs":
        return (
          <div className="admin-cs-container">
            <h3>공지사항 관리</h3>
            <AdminNoticeList />
            <hr style={{ margin: "40px 0" }} />
            <h3>자주 묻는 질문 관리</h3>
            <AdminFaqList />
            <hr style={{ margin: "40px 0" }} />
            <h3>1:1 문의 관리</h3>
            <AdminInquiryList />
          </div>
        );
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="admin-management-container">
      <div className="admin-tabs-nav" style={{ flexWrap: "wrap" }}>
        <button className={`admin-tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
          대시보드
        </button>
        <button className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          회원 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
          결제 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "classes" ? "active" : ""}`} onClick={() => setActiveTab("classes")}>
          클래스 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "instructors" ? "active" : ""}`} onClick={() => setActiveTab("instructors")}>
          강사 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "market" ? "active" : ""}`} onClick={() => setActiveTab("market")}>
          상품 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "reservations" ? "active" : ""}`} onClick={() => setActiveTab("reservations")}>
          예약 관리
        </button>
        <button className={`admin-tab-btn ${activeTab === "cs" ? "active" : ""}`} onClick={() => setActiveTab("cs")}>
          게시판/CS
        </button>
      </div>

      <div className="admin-tab-content">{renderContent()}</div>
    </div>
  );
};

export default AdminManagementPage;
