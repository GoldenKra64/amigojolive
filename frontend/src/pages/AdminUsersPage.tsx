import { useEffect, useMemo, useState } from 'react';
import Spinner from '../components/Spinner';
import { RoleBadge, UserStatusBadge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { extractErrorMessage } from '../api/client';
import { getUsers, updateUserStatus } from '../api/admin.service';
import type { AdminUser, UserStatus } from '../types';

const STATUSES: UserStatus[] = ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'BLOQUEADO'];

function formatDate(value: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(
          extractErrorMessage(error, 'No se pudieron cargar los usuarios')
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      return (
        u.institutionalEmail.toLowerCase().includes(term) ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  async function handleStatusChange(user: AdminUser, status: UserStatus) {
    if (status === user.status) return;
    setSavingId(user.id);
    try {
      const updated = await updateUserStatus(user.id, status);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: updated.status } : u
        )
      );
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error(
        extractErrorMessage(error, 'No se pudo actualizar el estado')
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado
            {users.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar por nombre, correo o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-72"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner label="Cargando usuarios..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No se encontraron usuarios.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Último login</th>
                  <th className="px-4 py-3">Cambiar estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user.institutionalEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.status}
                        disabled={savingId === user.id}
                        onChange={(e) =>
                          handleStatusChange(
                            user,
                            e.target.value as UserStatus
                          )
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-100"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
