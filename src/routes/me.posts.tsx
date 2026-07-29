import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/me/posts")({
  beforeLoad: () => {
    throw redirect({ to: "/commission" });
  },
});
