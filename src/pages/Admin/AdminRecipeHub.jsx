import { useState } from "react";
import AdminRecipeListManager from "./AdminRecipeListManager";
import AdminRecipeDeletedManager from "./AdminRecipeDeletedManager";
import "./AdminRecipeHub.css";

const RECIPE_TABS = [
    { id: "active", label: "레시피 목록 관리" },
    { id: "deleted", label: "삭제된 레시피 관리" },
];

export default function AdminRecipeHub() {
    const [activeTab, setActiveTab] = useState("active");

    return (
        <div className="admin-recipe-hub">
            <div className="admin-recipe-hub-head">
                <h2>레시피 통합 관리자</h2>
                <p>전체 레시피 조회, 수정, 삭제 및 삭제된 레시피 복구를 관리합니다.</p>
            </div>

            <div className="admin-recipe-subtabs" role="tablist">
                {RECIPE_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`admin-recipe-subtab-btn ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-recipe-subtab-content">
                {activeTab === "active" ? <AdminRecipeListManager /> : <AdminRecipeDeletedManager />}
            </div>
        </div>
    );
}
