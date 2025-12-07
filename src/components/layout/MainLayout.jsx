import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GlobalBanner from "../announcement/GlobalBanner";

/**
 * 主布局组件
 * 包含：全局横幅、导航栏、主要内容区域（Outlet）、页脚
 * 使用 Flexbox 确保页脚始终在底部
 */
export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏（固定置顶） */}
      <Navbar />
      
      {/* 全局横幅公告（fixed 定位，作为覆盖层，不影响内容流） */}
      <GlobalBanner />
      
      {/* 主要内容区域（自动伸缩，占据剩余空间，不添加额外 padding，各页面自行处理） */}
      <main className="flex-grow relative z-0">
        <Outlet />
      </main>
      
      {/* 页脚（强制置底） */}
      <Footer />
    </div>
  );
}

