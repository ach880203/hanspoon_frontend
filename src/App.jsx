// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/Shop/ProductsPage";
import ProductDetailPage from "./pages/Shop/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderDetailPage";
import AdminAddProductPage from "./pages/AdminAddProductPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import OrderDetailPage from "./pages/OrderDetailPage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MyWishesPage from "./pages/MyWishesPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import MyInquiriesPage from "./pages/MyInquiriesPage";

import FindIdPage from "./pages/Auth/FindIdPage";
import FindPasswordPage from "./pages/Auth/FindPasswordPage";
import NoticeList from "./pages/Notice/NoticeList";
import NoticeDetail from "./pages/Notice/NoticeDetail";
import EventList from "./pages/Event/EventList";
import EventDetail from "./pages/Event/EventDetail";
import FaqList from "./pages/Faq/FaqList";
import OAuth2RedirectHandler from "./pages/Auth/OAuth2RedirectHandler";

import AdminNoticeList from "./pages/Admin/AdminNoticeList";
import AdminNoticeWrite from "./pages/Admin/AdminNoticeWrite";
import AdminEventWrite from "./pages/Admin/AdminEventWrite";
import AdminFaqList from "./pages/Admin/AdminFaqList";
import AdminFaqWrite from "./pages/Admin/AdminFaqWrite";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminUserList from './pages/Admin/AdminUserList';
import AdminUserDetail from './pages/Admin/AdminUserDetail';
import AdminPaymentList from './pages/Admin/AdminPaymentList';
import AdminManagementPage from './pages/Admin/AdminManagementPage';

import MyPageLayout from "./pages/MyPage/MyPageLayout";
import MyClassPage from "./pages/MyPage/MyClassPage";
import ProfilePage from "./pages/MyPage/ProfilePage";
import MyPointsPage from "./pages/MyPage/MyPointsPage";
import MyPaymentPage from "./pages/MyPage/MyPaymentPage";

import OneDayRoutes from "./pages/OneDay/OneDayRoutes";

import RecipePage from "./pages/Recipe/RecipePage";
import Recipesid from "./pages/Recipe/Recipesid";
import Recipesuser from "./pages/Recipe/Recipesuser";
import RecipeList from "./pages/Recipe/RecipeList";
import RecipeWishes from "./pages/Recipe/RecipeWishes.jsx";

import Payment from "./pages/Payment/Payment";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFail from "./pages/Payment/PaymentFail";

import ProtectedRoute from "./components/ProtectedRoute";
import RecipeDeleteList from "./pages/Recipe/RecipeDeleteList";
import AddressTestPage from "./pages/AddressTestPage";
import SearchPage from "./pages/SearchPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="address-test" element={<AddressTestPage />} />
        <Route path="search" element={<SearchPage />} />

        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />

        <Route path="market" element={<Navigate to="/products" replace />} />

        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<MyOrdersPage />} />

        <Route path="/orders/:orderId" element={<OrderDetailPage />} />

        <Route path="admin" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminManagementPage />
          </ProtectedRoute>
        } />
        <Route path="admin/dashboard" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="admin/add-product" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminAddProductPage />
          </ProtectedRoute>
        } />

        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="find-id" element={<FindIdPage />} />
        <Route path="find-password" element={<FindPasswordPage />} />
        <Route path="oauth2/redirect" element={<OAuth2RedirectHandler />} />

        <Route path="recipes" element={<RecipePage title="레시피 등록" />} />
        <Route path="recipes/recipewishes" element={<RecipeWishes title="레시피 관심목록" />} />
        <Route path="recipes/user" element={<Recipesuser title="내 레시피" />} />
        <Route path="recipes/:id" element={<Recipesid title="레시피 상세" />} />
        <Route path="recipes/list" element={<RecipeList title="레시피 목록" />} />
        <Route path="recipes/deletelist" element={<RecipeDeleteList title="삭제된 레시피" />} />
        <Route path="recipes/edit/:id" element={<RecipePage title="레시피 수정" />} />

        <Route path="classes" element={<PlaceholderPage title="클래스" />} />
        <Route path="classes/oneday/*" element={<OneDayRoutes />} />
        <Route path="classes/regular" element={<PlaceholderPage title="정기 클래스" />} />
        <Route path="classes/event" element={<PlaceholderPage title="이벤트 클래스" />} />
        <Route path="classes/:id" element={<PlaceholderPage title="클래스 상세" />} />

        <Route path="notice" element={<NoticeList title="공지사항" />} />
        <Route path="notice/:id" element={<NoticeDetail />} />
        <Route path="event" element={<EventList />} />
        <Route path="event/:id" element={<EventDetail />} />
        <Route path="faq" element={<FaqList title="자주 묻는 질문" />} />

        <Route path="payment" element={<Payment />} />
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/fail" element={<PaymentFail />} />

        <Route path="mypage" element={<MyPageLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="reservations" element={<MyClassPage />} />
          <Route path="class-wishes" element={<Navigate to="/mypage/wishlist" replace />} />
          <Route path="wishlist" element={<MyWishesPage />} />
          <Route path="inquiries" element={<MyInquiriesPage title="내 문의" />} />
          <Route path="reviews" element={<MyReviewsPage title="내 리뷰" />} />


          <Route path="points" element={<MyPointsPage />} />
          <Route path="payments" element={<MyPaymentPage />} />
        </Route>

        <Route path="reviews" element={<MyReviewsPage title="리뷰" />} />
        <Route path="inquiries" element={<MyInquiriesPage title="문의" />} />
        <Route path="wishlist" element={<MyWishesPage title="관심 목록" />} />

        <Route path="admin/faq" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminFaqList />
          </ProtectedRoute>
        } />
        <Route path="admin/faq/write" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminFaqWrite />
          </ProtectedRoute>
        } />
        <Route path="admin/faq/edit/:id" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminFaqWrite />
          </ProtectedRoute>
        } />

        <Route path="admin/users" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminUserList />
          </ProtectedRoute>
        } />
        <Route path="admin/users/:id" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminUserDetail />
          </ProtectedRoute>
        } />
        <Route path="admin/market" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <PlaceholderPage title="마켓 관리" />
          </ProtectedRoute>
        } />
        <Route path="admin/classes" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <PlaceholderPage title="클래스 관리" />
          </ProtectedRoute>
        } />
        <Route path="admin/reservations" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <PlaceholderPage title="예약 관리" />
          </ProtectedRoute>
        } />
        <Route path="admin/payments" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminPaymentList />
          </ProtectedRoute>
        } />
        <Route path="admin/inquiries" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <PlaceholderPage title="문의 관리" />
          </ProtectedRoute>
        } />
        <Route path="admin/notice-faq" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <PlaceholderPage title="공지/자주 묻는 질문 관리" />
          </ProtectedRoute>
        } />

        <Route path="admin/notice" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminNoticeList />
          </ProtectedRoute>
        } />
        <Route path="admin/notice/write" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminNoticeWrite />
          </ProtectedRoute>
        } />
        <Route path="admin/notice/edit/:id" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminNoticeWrite />
          </ProtectedRoute>
        } />
        <Route path="admin/event/write" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminEventWrite />
          </ProtectedRoute>
        } />
        <Route path="admin/event/edit/:id" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminEventWrite />
          </ProtectedRoute>
        } />

        <Route path="*" element={<PlaceholderPage title="404" desc="페이지를 찾을 수 없습니다." />} />
      </Route>
    </Routes>
  );
}
