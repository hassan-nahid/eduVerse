import { UserGuard } from '@/components/guards/UserGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserGuard>{children}</UserGuard>
}
