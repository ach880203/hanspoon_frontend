import { useState } from "react";
import AdminProductManager from "./AdminProductManager";
import AdminProductInquiryManager from "./AdminProductInquiryManager";
import AdminProductReviewManager from "./AdminProductReviewManager";
import "./AdminProductHub.css";
import "./AdminProductManager.css";

const PRODUCT_TABS = [
  { id: "products", label: "상품 관리" },
  { id: "inquiries", label: "상품 문의 관리" },
  { id: "reviews", label: "상품 리뷰 관리" },
];

export default function AdminProductHub() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="admin-product-hub">
      <div className="admin-product-hub-head">
        <h2>상품 통합 관리</h2>
        <p>상품 등록/수정, 상품 문의 답변, 상품 리뷰 모니터링을 한 곳에서 처리합니다.</p>
      </div>

      <div className="admin-product-subtabs" role="tablist" aria-label="상품 관리 하위 탭">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`admin-product-subtab-btn ${activeTab === tab.id ? "active" : ""}`}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-product-subtab-content">
        {activeTab === "products" ? <AdminProductManager /> : null}
        {activeTab === "inquiries" ? <AdminProductInquiryManager /> : null}
        {activeTab === "reviews" ? <AdminProductReviewManager /> : null}
      </div>
    </div>
  );
}
