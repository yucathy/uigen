import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "../main-content";

// Mock context providers
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: vi.fn(),
}));

// Mock child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

// Mock resizable components
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders both Preview and Code buttons", () => {
  render(<MainContent />);

  expect(screen.getByRole("tab", { name: "Preview" })).toBeDefined();
  expect(screen.getByRole("tab", { name: "Code" })).toBeDefined();
});

test("Preview button is active by default and shows preview content", () => {
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("active");
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});

test("clicking Code button switches to code view", () => {
  render(<MainContent />);

  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);

  expect(codeTab.getAttribute("data-state")).toBe("active");
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
});

test("clicking Preview button after Code switches back to preview", () => {
  render(<MainContent />);

  // Switch to Code
  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to Preview
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Code view shows file tree and code editor together", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("preview frame is hidden when Code tab is active", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.queryByTestId("preview-frame")).toBeNull();
});
