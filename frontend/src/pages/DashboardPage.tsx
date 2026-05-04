import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge, UserStatusBadge } from '../components/Badge';

export default function DashboardPage() {
  const { user, profile } = useAuth();

  if (!user) return null;

  const roleGreeting: Record<typeof user.role, string> = {
    admin: 'Como administrador, puedes gestionar usuarios y aprobar solicitudes.',
    docente: 'Comparte tus experiencias y enriquece a la comunidad pedagógica.',
    moderador: 'Modera el contenido para mantener una comunidad sana.',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-wider text-brand-100">
          Bienvenido(a)
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-3 max-w-2xl text-brand-50">
          {roleGreeting[user.role]}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Rol
          </p>
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Estado
          </p>
          <div className="mt-2">
            <UserStatusBadge status={user.status} />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Correo
          </p>
          <p className="mt-2 truncate text-sm font-medium text-slate-900">
            {user.institutionalEmail}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Mi perfil docente
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Actualiza tu área, descripción y foto.
          </p>
          {profile?.profile && (
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">
                  Área
                </dt>
                <dd className="font-medium text-slate-900">
                  {profile.profile.area ?? 'Sin definir'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-500">
                  Descripción
                </dt>
                <dd className="text-slate-700">
                  {profile.profile.description ?? 'Sin descripción'}
                </dd>
              </div>
            </dl>
          )}
          <Link
            to="/perfil"
            className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Editar perfil →
          </Link>
        </div>

        {user.role === 'admin' ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Panel administrativo
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona usuarios y revisa las solicitudes pendientes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/admin/usuarios"
                className="inline-flex rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Usuarios
              </Link>
              <Link
                to="/admin/solicitudes"
                className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Solicitudes
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Comunidad pedagógica
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Próximamente: feed de publicaciones, recursos y comentarios entre
              colegas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
