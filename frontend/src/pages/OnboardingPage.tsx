import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { cn } from '../utils/cn';

const CHRONIC_CONDITIONS = ['Diabetes', 'Hipertensión', 'Asma', 'Ninguna'];
const LIFESTYLE_OPTIONS = ['Fumador', 'Sedentario', 'Activo/Deportista'];

export function OnboardingPage() {
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleConditionToggle = (condition: string) => {
    if (condition === 'Ninguna') {
      // Si selecciona "Ninguna", desmarca todo lo demás
      setSelectedConditions(['Ninguna']);
    } else {
      // Si selecciona una enfermedad
      setSelectedConditions(prev => {
        // Remover "Ninguna" si existe
        const withoutNinguna = prev.filter(c => c !== 'Ninguna');
        
        // Toggle de la condición seleccionada
        if (withoutNinguna.includes(condition)) {
          return withoutNinguna.filter(c => c !== condition);
        } else {
          return [...withoutNinguna, condition];
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de peso y talla
    const pesoNum = parseFloat(peso);
    const tallaNum = parseFloat(talla);
    
    if (!peso || !talla || pesoNum <= 0 || tallaNum <= 0) {
      alert('Por favor ingresa valores válidos y positivos para peso y talla');
      return;
    }
    
    if (pesoNum < 30 || pesoNum > 300) {
      alert('Por favor ingresa un peso válido entre 30 y 300 kg');
      return;
    }
    
    if (tallaNum < 100 || tallaNum > 250) {
      alert('Por favor ingresa una talla válida entre 100 y 250 cm');
      return;
    }
    
    if (selectedConditions.length === 0) {
      alert('Por favor selecciona al menos una condición crónica');
      return;
    }
    
    if (!lifestyle) {
      alert('Por favor selecciona tu estilo de vida');
      return;
    }
    
    setIsLoading(true);

    // Simular guardado de datos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar usuario con isFirstTime: false
    updateUser({ isFirstTime: false });
    
    // Marcar que debe mostrar el tutorial
    localStorage.setItem('rimiapp_tutorial_pending', 'true');
    
    setIsLoading(false);
    
    // Forzar navegación con replace
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Hola {user?.name}, para cuidarte mejor, validemos tu perfil de salud actual
          </h1>
          <p className="text-secondary/60">
            Completa tu Smart Health Check
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Peso y Talla */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Peso (kg)"
                type="number"
                placeholder="Ej: 70"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                required
              />
              
              <Input
                label="Talla (cm)"
                type="number"
                placeholder="Ej: 175"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                required
              />
            </div>

            {/* Condiciones Crónicas */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                Condiciones Crónicas
              </label>
              <div className="flex flex-wrap gap-2">
                {CHRONIC_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      selectedConditions.includes(condition)
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                    )}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo de Vida */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                Estilo de Vida
              </label>
              <div className="space-y-2">
                {LIFESTYLE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                      lifestyle === option
                        ? 'bg-accent/10 border-2 border-accent'
                        : 'bg-secondary/5 border-2 border-transparent hover:bg-secondary/10'
                    )}
                  >
                    <input
                      type="radio"
                      name="lifestyle"
                      value={option}
                      checked={lifestyle === option}
                      onChange={(e) => setLifestyle(e.target.value)}
                      className="w-4 h-4 text-accent focus:ring-accent"
                      required
                    />
                    <span className="text-sm font-medium text-secondary">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Completar Perfil
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
