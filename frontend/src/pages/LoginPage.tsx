import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

export function LoginPage() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(dni, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">RimiApp</h1>
          <p className="text-secondary/60">Tu asistente de salud y seguros</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="DNI"
              type="text"
              placeholder="Ingresa tu DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-primary/10 border border-primary rounded-xl">
                <p className="text-sm text-primary">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 p-4 bg-background rounded-xl">
            <p className="text-xs text-secondary/60 text-center">
              Usuario de prueba: <strong>123456789</strong> / <strong>usuario</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
