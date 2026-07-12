import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/points-rules')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/points-rules"!</div>
}
