import { useEffect, useState } from 'react';
import { getPublications, createPublication } from '../api/publication.service';
import type { Publication } from '../types';
import PublicationCard from '../components/PublicationCard';

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    try {
      const data = await getPublications();
      setPublications(data);
    } catch (err) {
      setError('No se pudieron cargar las publicaciones.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('isAnonymous', 'false');
      
      await createPublication(formData);
      setTitle('');
      setContent('');
      await fetchPublications();
    } catch (err) {
      alert('Error al crear la publicación.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Feed de Publicaciones</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border-slate-300 p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              placeholder="Título de tu publicación"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contenido (HTML permitido)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border-slate-300 p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              placeholder="Escribe algo... <script>alert('XSS')</script>"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Publicar
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p>Cargando publicaciones...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : publications.length === 0 ? (
          <p>No hay publicaciones todavía.</p>
        ) : (
          publications.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} onDelete={fetchPublications} />
          ))
        )}
      </div>
    </div>
  );
}
