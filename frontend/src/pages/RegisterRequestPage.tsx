import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';
import { useToast } from '../components/Toast';
import { extractErrorMessage } from '../api/client';
import { registerRequest } from '../api/auth.service';

interface FormState {
  firstName: string;
  lastName: string;
  institutionalEmail: string;
  password: string;
  passwordConfirm: string;
  area: string;
  description: string;
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  institutionalEmail: '',
  password: '',
  passwordConfirm: '',
  area: '',
  description: '',
};

export default function RegisterRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'Ingrese sus nombres';
    if (!form.lastName.trim()) next.lastName = 'Ingrese sus apellidos';
    if (
      !form.institutionalEmail.trim() ||
      !form.institutionalEmail.includes('@')
    ) {
      next.institutionalEmail = 'Correo institucional inválido';
    }
    if (form.password.length < 8) {
      next.password = 'Mínimo 8 caracteres';
    }
    if (form.password !== form.passwordConfirm) {
      next.passwordConfirm = 'Las contraseñas no coinciden';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registerRequest({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        institutionalEmail: form.institutionalEmail.trim(),
        password: form.password,
        area: form.area.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      toast.success(
        'Solicitud enviada. Un administrador la revisará en breve.'
      );
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(
        extractErrorMessage(error, 'No se pudo enviar la solicitud')
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Solicitud de registro
          </h1>
          <p className="text-sm text-slate-600">
            Completa tus datos. Un administrador revisará y aprobará tu acceso.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombres"
              name="firstName"
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              error={errors.firstName}
            />
            <Field
              label="Apellidos"
              name="lastName"
              required
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              error={errors.lastName}
            />
            <Field
              label="Correo institucional"
              name="institutionalEmail"
              type="email"
              placeholder="docente@institucion.edu.ec"
              autoComplete="email"
              required
              value={form.institutionalEmail}
              onChange={(e) => update('institutionalEmail', e.target.value)}
              error={errors.institutionalEmail}
              hint="Será tu usuario para iniciar sesión"
            />
            <Field
              label="Área pedagógica"
              name="area"
              placeholder="Matemáticas, Lengua, Ciencias..."
              value={form.area}
              onChange={(e) => update('area', e.target.value)}
              error={errors.area}
            />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              hint="Mínimo 8 caracteres"
            />
            <Field
              label="Confirmar contraseña"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              error={errors.passwordConfirm}
            />
          </div>

          <div className="mt-4">
            <Field
              as="textarea"
              label="Descripción / experiencia (opcional)"
              name="description"
              placeholder="Cuéntanos brevemente sobre tu trayectoria docente"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              error={errors.description}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/login"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              ← Volver a iniciar sesión
            </Link>
            <Button type="submit" size="lg" loading={submitting}>
              Enviar solicitud
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
