import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-brand-600">
        Error 404
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Página no encontrada
      </h1>
      <p className="max-w-md text-sm text-slate-600">
        La ruta que intentaste abrir no existe o fue movida.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
