"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  state: "call" | "result" | "partial-call";
  args?: Record<string, unknown>;
  result?: unknown;
}

function getToolDisplayText(
  toolName: string,
  args?: Record<string, unknown>
): string {
  if (toolName === "str_replace_editor") {
    const command = args?.command as string | undefined;
    const path = args?.path as string | undefined;
    const fileName = path?.split("/").pop() || "file";

    switch (command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
        return `Modifying ${fileName}`;
      case "insert":
        return `Editing ${fileName}`;
      case "view":
        return `Viewing ${fileName}`;
      case "undo_edit":
        return `Reverting changes to ${fileName}`;
      default:
        return `Editing ${fileName}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command as string | undefined;
    const path = args?.path as string | undefined;
    const newPath = args?.new_path as string | undefined;
    const fileName = path?.split("/").pop() || "file";
    const newFileName = newPath?.split("/").pop();

    switch (command) {
      case "rename":
        return newFileName
          ? `Renaming ${fileName} to ${newFileName}`
          : `Renaming ${fileName}`;
      case "delete":
        return `Deleting ${fileName}`;
      default:
        return `Managing ${fileName}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolName,
  state,
  args,
  result,
}: ToolInvocationBadgeProps) {
  const displayText = getToolDisplayText(toolName, args);
  const isCompleted = state === "result" && result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayText}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayText}</span>
        </>
      )}
    </div>
  );
}
