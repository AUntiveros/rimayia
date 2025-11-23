import { useState } from 'react';
import { useFamilyNetwork } from '../../hooks/useFamilyNetwork';
import { Button, Flex, Heading, Input, Text, Card, Alert, Loader } from '@aws-amplify/ui-react';

export const FamilyLinker = () => {
  const { vincularFamiliar, loading, error } = useFamilyNetwork();
  
  const [dniPadre, setDniPadre] = useState('');
  const [miDni, setMiDni] = useState(''); 
  const [successMsg, setSuccessMsg] = useState('');

  const handleVincular = async () => {
    if (!dniPadre || !miDni) return;
    setSuccessMsg('');
    
    try {
      await vincularFamiliar(dniPadre, miDni);
      setSuccessMsg(`¡Éxito! Vinculación correcta con DNI ${dniPadre}`);
      setDniPadre('');
    } catch (e) {
      // El error ya se maneja en el hook, pero aquí podemos limpiar
    }
  };

  return (
    <Card variation="elevated" className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <Flex direction="column" gap="1rem">
        <Heading level={4} color="#E30613">🔗 Conectar Familiar</Heading>
        <Text fontSize="0.9rem" color="gray">Ingresa los datos para gestionar la salud de un familiar.</Text>

        <Input placeholder="Tu DNI (Gestor)" value={miDni} onChange={(e) => setMiDni(e.target.value)} />
        <Input placeholder="DNI del Paciente" value={dniPadre} onChange={(e) => setDniPadre(e.target.value)} />

        <Button 
          variation="primary" 
          isLoading={loading} 
          onClick={handleVincular}
          style={{ backgroundColor: '#E30613', color: 'white' }}
        >
          {loading ? <Loader size="small" /> : 'Vincular Ahora'}
        </Button>

        {error && <Alert variation="error" heading="Error">{error}</Alert>}
        {successMsg && <Alert variation="success">{successMsg}</Alert>}
      </Flex>
    </Card>
  );
};