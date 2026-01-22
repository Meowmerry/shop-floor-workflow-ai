import { useContext } from "react";
import { WorkflowContext, type WorkflowContextType } from "../contexts/WorkflowContext";

export function useWorkflow(): WorkflowContextType {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
