import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/points/history')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/points/history"!</div>
}
