import type { ReactNode } from 'react';
import type { RegistrationRequestStatus, Role, UserStatus } from '../types';

type Tone = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  blue: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

const userStatusTone: Record<UserStatus, Tone> = {
  ACTIVO: 'green',
  INACTIVO: 'gray',
  PENDIENTE: 'yellow',
  BLOQUEADO: 'red',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={userStatusTone[status]}>{status}</Badge>;
}

const requestStatusTone: Record<RegistrationRequestStatus, Tone> = {
  PENDIENTE: 'yellow',
  APROBADA: 'green',
  RECHAZADA: 'red',
};

export function RequestStatusBadge({
  status,
}: {
  status: RegistrationRequestStatus;
}) {
  return <Badge tone={requestStatusTone[status]}>{status}</Badge>;
}

const roleTone: Record<Role, Tone> = {
  admin: 'purple',
  docente: 'blue',
  moderador: 'yellow',
};

const roleLabel: Record<Role, string> = {
  admin: 'Administrador',
  docente: 'Docente',
  moderador: 'Moderador',
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={roleTone[role]}>{roleLabel[role]}</Badge>;
}
