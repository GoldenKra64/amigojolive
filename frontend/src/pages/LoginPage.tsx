import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { extractErrorMessage } from '../api/client';

interface LocationState {
  from?: { pathname?: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [institutionalEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!institutionalEmail.trim() || !institutionalEmail.includes('@')) {
      next.email = 'Ingrese un correo institucional válido';
    }
    if (!password) {
      next.password = 'La contraseña es obligatoria';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({
        institutionalEmail: institutionalEmail.trim(),
        password,
      });
      toast.success('Sesión iniciada correctamente');
      const target =
        (location.state as LocationState | null)?.from?.pathname ?? '/dashboard';
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo iniciar sesión'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            AmigoJoLive
          </h1>
          <p className="text-sm text-slate-600">
            Red pedagógica de docentes Fe y Alegría
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200"
        >
          <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Iniciar sesión
          </h2>

          <div className="flex flex-col gap-4">
            <Field
              label="Correo institucional"
              name="institutionalEmail"
              type="email"
              placeholder="docente@institucion.edu.ec"
              autoComplete="email"
              required
              value={institutionalEmail}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            className="mt-6 w-full"
            size="lg"
            loading={submitting}
          >
            Ingresar
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Eres docente nuevo?{' '}
            <Link
              to="/register"
              className="font-medium text-brand-700 hover:text-brand-800"
            >
              Solicita tu registro
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
