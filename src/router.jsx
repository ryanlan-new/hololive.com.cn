import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import WebsiteAnnouncements from "./pages/WebsiteAnnouncements";
import ServerInfo from "./pages/ServerInfo";
import OtherDocuments from "./pages/OtherDocuments";
import MainLayout from "./components/layout/MainLayout";
import ErrorPage from "./pages/ErrorPage";
import AdminGuard from "./components/auth/AdminGuard";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/Posts";
import PostEditor from "./pages/admin/PostEditor";
import WhitelistPage from "./pages/admin/WhitelistPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AnnouncementPage from "./pages/admin/AnnouncementPage";
import MediaPage from "./pages/admin/MediaPage";
import HomeManager from "./pages/admin/HomeManager";
import SectionEditor from "./pages/admin/SectionEditor";
import ServerMapManager from "./pages/admin/ServerMapManager";
import ServerInfoFields from "./pages/admin/ServerInfoFields";
import AuditLogs from "./pages/admin/AuditLogs";
import ArticleDetail from "./pages/ArticleDetail";
import VelocityManager from "./pages/admin/VelocityManager";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "docs",
        element: <Docs />,
      },
      {
        path: "docs/announcements",
        element: <WebsiteAnnouncements />,
      },
      {
        path: "docs/server-info",
        element: <ServerInfo />,
      },
      {
        path: "docs/documents",
        element: <OtherDocuments />,
      },
      {
        path: "docs/article/:id",
        element: <ArticleDetail />,
      },
    ],
  },
  {
    path: "/403",
    element: <ErrorPage code="E403" />,
  },
  {
    path: "/404",
    element: <ErrorPage code="E404" />,
  },
  {
    path: "/418",
    element: <ErrorPage code="E418" />,
  },
  {
    path: "/500",
    element: <ErrorPage code="E500" />,
  },
  {
    path: "/503",
    element: <ErrorPage code="E503" />,
  },
  {
    path: "/:adminKey/webadmin",
    element: <AdminGuard />, // 第一道防线：隐蔽路径验证
    children: [
      {
        index: true, // 访问根路径时默认跳转到 login
        element: <Navigate to="login" replace />,
      },
      {
        path: "login",
        element: <AdminLogin />,
      },
      {
        // 受保护的区域：需要登录验证
        element: <RequireAdminAuth />, // 第二道防线：身份验证
        children: [
          {
            // 使用 AdminLayout 包裹所有后台管理页面
            element: <AdminLayout />,
            children: [
              {
                index: true, // 默认跳转到 dashboard
                element: <Navigate to="dashboard" replace />,
              },
              {
                path: "dashboard",
                element: <AdminDashboard />,
              },
              {
                path: "posts",
                element: <Posts />,
              },
              {
                path: "posts/new",
                element: <PostEditor />,
              },
              {
                path: "posts/:id",
                element: <PostEditor />,
              },
              {
                path: "accounts/whitelist",
                element: <WhitelistPage />,
              },
              {
                path: "accounts/local",
                element: <AdminUsersPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
              },
              {
                path: "announcements",
                element: <AnnouncementPage />,
              },
              {
                path: "media",
                element: <MediaPage />,
              },
              {
                path: "home",
                element: <HomeManager />,
              },
              {
                path: "home/new",
                element: <SectionEditor />,
              },
              {
                path: "home/:id",
                element: <SectionEditor />,
              },
              {
                path: "server-maps",
                element: <ServerMapManager />,
              },
              {
                path: "server-info-fields",
                element: <ServerInfoFields />,
              },
              {
                path: "logs",
                element: <AuditLogs />,
              },
              {
                path: "velocity",
                element: <VelocityManager />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage code="E404" />,
  },
]);

export default router;
