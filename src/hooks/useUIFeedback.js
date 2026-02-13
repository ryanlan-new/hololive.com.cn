import { useContext } from "react";
import { FeedbackContext } from "../components/ui/feedbackContext";

export function useUIFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useUIFeedback must be used within FeedbackProvider");
  }
  return context;
}
