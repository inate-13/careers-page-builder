 
// app/signup/page.tsx
import AuthForm from '../components/AuthForm';

export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <AuthForm mode="signup" />
    </div>
  );
}
