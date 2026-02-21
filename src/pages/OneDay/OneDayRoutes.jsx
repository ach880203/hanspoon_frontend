import { Routes, Route, Navigate } from "react-router-dom";

import { OneDayHome } from "./OneDayHome";
import { OneDayClasses } from "./OneDayClasses";
import { OneDayClassDetail } from "./OneDayClassDetail";
import { OneDaySessionSearch } from "./OneDaySessionSearch";
import { OneDayReservations } from "./OneDayReservations";
import { OneDayWishes } from "./OneDayWishes";
import { OneDayCoupons } from "./OneDayCoupons";
import { OneDayInquiryWrite } from "./OneDayInquiryWrite";
import { ClassOneDayCreatePage } from "./ClassOneDayCreatePage";

export default function OneDayRoutes() {
  return (
    <Routes>
      <Route index element={<OneDayHome />} />
      <Route path="classes" element={<OneDayClasses />} />
      <Route path="classes/:classId" element={<OneDayClassDetail />} />
      <Route path="search" element={<OneDaySessionSearch />} />
      <Route path="reservations" element={<OneDayReservations />} />
      <Route path="wishes" element={<OneDayWishes />} />
      <Route path="coupons" element={<OneDayCoupons />} />
      <Route path="inquiry" element={<OneDayInquiryWrite />} />
      <Route path="create" element={<ClassOneDayCreatePage />} />

      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
