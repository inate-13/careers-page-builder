// app/login/page.tsx
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <AuthForm mode="login" />
    </div>
  );
}
