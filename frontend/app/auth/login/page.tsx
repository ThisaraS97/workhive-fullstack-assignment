import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';
import { LoadingState } from '@/components/ui/Common';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}
