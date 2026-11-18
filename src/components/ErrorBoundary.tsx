import { Component, type ReactNode } from "react";

/** If something unexpected breaks the page, show a short message and reload by itself. The game carries on. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error(err);
    setTimeout(() => location.reload(), 3000);
  }
  render() {
    if (this.state.failed)
      return <p style={{ padding: 24, fontSize: 20, fontFamily: "system-ui" }}>Something went wrong. Reloading in 3 seconds… / Memuat semula…</p>;
    return this.props.children;
  }
}
