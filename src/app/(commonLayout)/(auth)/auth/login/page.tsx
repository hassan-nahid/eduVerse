import { AuthLayout } from '@/components/modules/Auth/AuthLayout'
import { LoginForm } from '@/components/modules/Auth/LoginForm'

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue your learning journey and compete with friends."
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage