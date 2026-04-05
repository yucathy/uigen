import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("displays 'Creating' for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/App.tsx" }}
    />
  );

  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("displays 'Modifying' for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "str_replace", path: "/components/Button.tsx" }}
    />
  );

  expect(screen.getByText("Modifying Button.tsx")).toBeDefined();
});

test("displays 'Editing' for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "insert", path: "/utils/helpers.ts" }}
    />
  );

  expect(screen.getByText("Editing helpers.ts")).toBeDefined();
});

test("displays 'Viewing' for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "view", path: "/config.json" }}
    />
  );

  expect(screen.getByText("Viewing config.json")).toBeDefined();
});

test("displays 'Reverting changes' for str_replace_editor undo_edit command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "undo_edit", path: "/App.tsx" }}
    />
  );

  expect(screen.getByText("Reverting changes to App.tsx")).toBeDefined();
});

test("displays 'Editing' as fallback for unknown str_replace_editor command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "unknown", path: "/test.ts" }}
    />
  );

  expect(screen.getByText("Editing test.ts")).toBeDefined();
});

test("displays 'Renaming' for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      state="call"
      args={{
        command: "rename",
        path: "/old-file.tsx",
        new_path: "/new-file.tsx",
      }}
    />
  );

  expect(screen.getByText("Renaming old-file.tsx to new-file.tsx")).toBeDefined();
});

test("displays 'Deleting' for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      state="call"
      args={{ command: "delete", path: "/temp.tsx" }}
    />
  );

  expect(screen.getByText("Deleting temp.tsx")).toBeDefined();
});

test("displays tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      state="call"
      args={{}}
    />
  );

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows loading spinner when state is not 'result'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/App.tsx" }}
    />
  );

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

test("shows success indicator when state is 'result'", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.tsx" }}
      result="Success"
    />
  );

  const successDot = container.querySelector(".bg-emerald-500");
  expect(successDot).toBeDefined();

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});

test("handles missing path gracefully", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create" }}
    />
  );

  expect(screen.getByText("Creating file")).toBeDefined();
});

test("handles missing args gracefully", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
    />
  );

  expect(screen.getByText("Editing file")).toBeDefined();
});

test("handles nested file paths correctly", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/components/ui/Button.tsx" }}
    />
  );

  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("applies correct styling classes", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/App.tsx" }}
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("gap-2");
  expect(badge.className).toContain("bg-neutral-50");
  expect(badge.className).toContain("rounded-lg");
  expect(badge.className).toContain("border-neutral-200");
});
