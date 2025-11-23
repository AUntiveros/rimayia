import { useEffect, useState } from 'react';
// CORRECCIÓN AQUÍ: Agregamos "type" antes de FamilyMember
import { useFamilyNetwork, type FamilyMember } from '../../hooks/useFamilyNetwork';
import { Card, Heading, Text, Badge, Button, Flex, Loader, Grid, View } from '@aws-amplify/ui-react';

export const FamilyDashboard = () => {
  const { getDashboard, loading } = useFamilyNetwork();
  const [pacientes, setPacientes] = useState<FamilyMember[]>([]);
  
  const miDni = "12345678"; 

  useEffect(() => {
    getDashboard(miDni).then(data => setPacientes(data));
  }, []);

  if (loading) return <Flex justifyContent="center" padding="2rem"><Loader size="large" /></Flex>;

  return (
    <View padding="1rem">
      <Heading level={3} color="#333" marginBottom="1rem">👨‍👩‍👧 Mi Red de Cuidado</Heading>
      
      {pacientes.length === 0 ? (
        <Text fontStyle="italic" color="gray">No se encontraron familiares vinculados para el DNI {miDni}.</Text>
      ) : (
        <Grid templateColumns={{ base: '1fr', medium: '1fr 1fr' }} gap="1rem">
          {pacientes.map((p) => (
            <Card key={p.dni} variation="outlined" style={{ borderColor: p.alerta_cronica ? '#E30613' : '#27AE60', borderWidth: '2px' }}>
              <Flex direction="column" gap="0.5rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={5}>{p.nombre}</Heading>
                  <Badge variation={p.alerta_cronica ? "error" : "success"}>
                    {p.alerta_cronica ? "⚠️ Crónico" : "Saludable"}
                  </Badge>
                </Flex>

                <Flex gap="1rem" marginTop="5px">
                    <Card variation="outlined" style={{ flex: 1, backgroundColor: p.adherencia === 'VERDE' ? '#f0fff4' : '#fff5f5', padding: '0.5rem', textAlign: 'center' }}>
                        <Text fontSize="0.7rem" fontWeight="bold">ADHERENCIA</Text>
                        <Text fontSize="1.2rem">{p.adherencia === 'VERDE' ? '✅' : '🔴'}</Text>
                    </Card>
                    <Card variation="outlined" style={{ flex: 1, padding: '0.5rem', textAlign: 'center' }}>
                        <Text fontSize="0.7rem" fontWeight="bold">RITMO</Text>
                        <Text fontSize="1.2rem">❤️ {p.signos_vitales?.pulso || '--'}</Text>
                    </Card>
                </Flex>

                <Text fontSize="0.8rem" color="#555">
                  Diagnóstico: <b>{p.ultimo_diagnostico}</b>
                </Text>
                <Text fontSize="0.8rem" color="#555">
                  Próxima Cita: {p.proxima_cita}
                </Text>

                <Button size="small" variation="primary" style={{ marginTop: '0.5rem', backgroundColor: '#E30613' }}>
                  🔔 Recordar Medicamento
                </Button>
              </Flex>
            </Card>
          ))}
        </Grid>
      )}
    </View>
  );
};