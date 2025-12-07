import { RouterProvider } from "react-router-dom";
import router from "./router";
import AnalyticsInjector from "./components/analytics/AnalyticsInjector";

export default function App() {
  return (
    <>
      <AnalyticsInjector />
      <RouterProvider router={router} />
    </>
  );
}
