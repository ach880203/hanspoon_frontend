import { Routes, Route, Navigate } from "react-router-dom";

import { OneDayExplorePage } from "./OneDayExplorePage";
import { OneDayClassDetail } from "./OneDayClassDetail";
import { OneDayReservations } from "./OneDayReservations";
import { OneDayWishes } from "./OneDayWishes";
import { OneDayCoupons } from "./OneDayCoupons";
import { OneDayInquiryWrite } from "./OneDayInquiryWrite";

export default function OneDayRoutes() {
  return (
    <Routes>
      <Route index element={<OneDayExplorePage />} />
      <Route path="classes" element={<OneDayExplorePage />} />
      <Route path="classes/:classId" element={<OneDayClassDetail />} />
      <Route path="search" element={<OneDayExplorePage />} />
      <Route path="reservations" element={<OneDayReservations />} />
      <Route path="wishes" element={<OneDayWishes />} />
      <Route path="coupons" element={<OneDayCoupons />} />
      <Route path="inquiry" element={<OneDayInquiryWrite />} />

      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
