import { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type State = { error: Error | null };

/**
 * 兜底 React 错误边界：捕获 TanStack Router errorComponent 之外的白屏错误
 * （Provider / Portal / 事件处理器内部渲染异常等）。
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[AppErrorBoundary]", error);
    try {
      reportLovableError(error, { boundary: "app_error_boundary" });
    } catch {
      /* ignore */
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  handleHome = () => {
    if (typeof window !== "undefined") window.location.assign("/");
  };

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl">
            ⚠️
          </div>
          <h1 className="mt-4 text-lg font-semibold text-foreground">页面出错了</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            页面加载异常，你可以尝试重新加载或返回首页。
          </p>
          <details className="mt-3 text-left text-[11px] text-muted-foreground">
            <summary className="cursor-pointer">错误详情</summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted/60 p-2 text-[10px] leading-snug">
              {error.message}
            </pre>
          </details>
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={this.handleReload}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              重新加载
            </button>
            <button
              onClick={this.handleHome}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              返回首页
            </button>
            <button
              onClick={this.handleReset}
              className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            >
              继续尝试当前页面
            </button>
          </div>
        </div>
      </div>
    );
  }
}