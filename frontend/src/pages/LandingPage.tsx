import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      {/* Fondo dinámico */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50/80 to-slate-100" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900 transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            amigojolive
          </Link>
          <nav
            className="flex items-center gap-2 sm:gap-6"
            aria-label="Acciones de cuenta"
          >
            <Link
              to="/login"
              className="rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-6"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero split */}
      <main className="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          {/* Columna texto */}
          <div className="order-2 text-center md:order-1 md:text-left">
            <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-base font-medium text-blue-800">
              Red pedagógica · Fe y Alegría
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Construye una{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                comunidad pedagógica segura
              </span>{' '}
              para docentes que inspiran
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 md:text-xl">
              Nuestra misión es crear una comunidad pedagógica segura para
              profesores, desde educación primaria hasta áreas educativas
              universitarias, donde puedan compartir contenido, consejos,
              frustraciones e ideas.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <Link
                to="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Únete a la comunidad
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Ya tengo cuenta
              </Link>
            </div>

            <ul
              className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start"
              aria-label="Beneficios de la plataforma"
            >
              {[
                'Espacio seguro para docentes',
                'Primaria a universidad',
                'Comparte ideas y experiencias',
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna imagen */}
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative w-full max-w-lg">
              <div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-400/20 via-indigo-300/20 to-amber-200/30 blur-sm"
                aria-hidden="true"
              />
              <div className="relative rotate-1 rounded-3xl border border-white/60 bg-white/40 p-3 shadow-2xl backdrop-blur-sm transition duration-500 hover:rotate-0">
                <img
                  src={heroImage}
                  alt="Docentes colaborando en un entorno pedagógico acogedor y moderno"
                  className="w-full rounded-2xl object-cover shadow-lg"
                  width={640}
                  height={480}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div
                className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:block"
                aria-hidden="true"
              >
                <p className="text-base font-semibold text-slate-900">
                  + docentes conectados
                </p>
                <p className="text-base text-slate-600">
                  Comparte, aprende y crece
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white/60 px-4 py-6 text-center backdrop-blur-sm sm:px-6">
        <p className="text-base text-slate-600">
          © {new Date().getFullYear()} amigojolive — Comunidad pedagógica para
          docentes
        </p>
      </footer>
    </div>
  );
}
