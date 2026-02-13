import { RouterProvider } from "react-router-dom";
import router from "./router";
import AnalyticsInjector from "./components/analytics/AnalyticsInjector";
import { FeedbackProvider } from "./components/ui/FeedbackProvider";

export default function App() {
  return (
    <FeedbackProvider>
      <AnalyticsInjector />
      <RouterProvider router={router} />
    </FeedbackProvider>
  );
}
