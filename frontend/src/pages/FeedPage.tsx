import { useEffect, useState, useCallback } from 'react';
import { getPublications } from '../api/publication.service';
import { getCategories, type Category } from '../api/category.service';
import type { Publication } from '../types';
import PublicationCard from '../components/PublicationCard';
import CreatePublicationModal from '../components/CreatePublicationModal';
import Button from '../components/Button';

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    getCategories()
      .then(setAvailableCategories)
      .catch(() => {});
  }, []);

  const fetchPublications = useCallback(async (tagIds: number[] = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublications(tagIds.length > 0 ? tagIds : undefined);
      setPublications(data);
    } catch (err) {
      setError('No se pudieron cargar las publicaciones.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications(selectedTagIds);
  }, [selectedTagIds, fetchPublications]);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const clearFilters = () => setSelectedTagIds([]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Feed de Publicaciones</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            + Nueva Publicación
          </Button>
        </div>

        {availableCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Filtrar por:
            </span>
            {availableCategories.map((cat) => {
              const active = selectedTagIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleTag(cat.id)}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            {selectedTagIds.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-red-500 underline transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando publicaciones...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : publications.length === 0 ? (
          <p className="text-sm text-slate-500">
            {selectedTagIds.length > 0
              ? 'No hay publicaciones para las categorías seleccionadas.'
              : 'No hay publicaciones todavía.'}
          </p>
        ) : (
          publications.map((pub) => (
            <PublicationCard
              key={pub.id}
              pub={pub}
              onDelete={() => fetchPublications(selectedTagIds)}
            />
          ))
        )}
      </div>

      <CreatePublicationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchPublications(selectedTagIds)}
      />
    </div>
  );
}
