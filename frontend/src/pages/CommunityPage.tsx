import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui';
import { COMMUNITIES } from '../data/mockData';

export function CommunityPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-6">
        {/* Header con botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Tus Comunidades de Salud
          </h1>
          <p className="text-secondary/60">
            Únete a comunidades que comparten tus intereses
          </p>
        </div>

        {/* Lista de Comunidades */}
        <div className="space-y-4">
          {COMMUNITIES.map((community) => (
            <Card key={community.id} className="overflow-hidden p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Imagen con gradiente cinemático */}
                <div 
                  className="w-full sm:w-32 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden"
                >
                  <img
                    src={community.image}
                    alt={community.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2">
                    {community.title}
                  </h3>
                  <p className="text-sm text-secondary/70 mb-2">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <p className="text-xs text-accent font-medium">
                      {community.benefit}
                    </p>
                  </div>
                  <button className="flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all">
                    {community.ctaText}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
