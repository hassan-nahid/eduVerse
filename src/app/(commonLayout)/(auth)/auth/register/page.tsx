import { AuthLayout } from '@/components/modules/Auth/AuthLayout'
import { RegisterForm } from '@/components/modules/Auth/RegisterForm'

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join the community and start your gamified learning adventure today."
    >
      <RegisterForm />
    </AuthLayout>
  )
}

export default RegisterPage