import { useEffect, useState, type FormEvent } from 'react';
import Button from '../components/Button';
import Field from '../components/Field';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { extractErrorMessage } from '../api/client';
import {
  getMyProfile,
  updateMyProfile,
} from '../api/profile.service';
import { useAuth } from '../context/AuthContext';
import type { MeResponse } from '../types';

export default function ProfilePage() {
  const toast = useToast();
  const { refreshMe } = useAuth();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setArea(data.profile?.area ?? '');
        setDescription(data.profile?.description ?? '');
        setPhotoUrl(data.profile?.photoUrl ?? '');
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(extractErrorMessage(error, 'No se pudo cargar el perfil'));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        area: area.trim(),
        description: description.trim(),
        photoUrl: photoUrl.trim(),
      });
      setProfile(updated);
      toast.success('Perfil actualizado correctamente');
      await refreshMe();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'No se pudo guardar el perfil'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner label="Cargando perfil..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-700">No fue posible cargar tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-600">
          Mantén tu información actualizada para que tus colegas te conozcan
          mejor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center gap-3 text-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-brand-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
                {profile.firstName?.[0]?.toUpperCase()}
                {profile.lastName?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-slate-600">
                {profile.institutionalEmail}
              </p>
            </div>
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombres"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Field
              label="Apellidos"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Field
              label="Área pedagógica"
              name="area"
              placeholder="Matemáticas, Lengua, Ciencias..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <Field
              label="URL de foto de perfil"
              name="photoUrl"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <Field
            as="textarea"
            label="Descripción"
            name="description"
            placeholder="Cuéntanos sobre tu trayectoria docente"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
