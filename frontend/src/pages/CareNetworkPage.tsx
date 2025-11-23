import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Heart, Activity, Shield, Bell, Calendar, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card'; 
import { useAuth } from '../context/AuthContext';
// CORRECCIÓN AQUÍ: Agregamos "type"
import { useFamilyNetwork, type FamilyMember } from '../hooks/useFamilyNetwork'; 

export function CareNetworkPage() {
  // ... (El resto del código se mantiene igual, no necesitas copiarlo todo de nuevo si solo cambias la línea del import) ...
  // PERO para evitar errores, aquí está la línea corregida que debes buscar:
  
  /* BUSCA ESTA LÍNEA Y REEMPLÁZALA: */
  /* import { useFamilyNetwork, FamilyMember } from '../hooks/useFamilyNetwork'; */
  
  /* POR ESTA: */
  /* import { useFamilyNetwork, type FamilyMember } from '../hooks/useFamilyNetwork'; */

  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  
  const { vincularFamiliar, getDashboard, loading } = useFamilyNetwork();

  // 1. CARGAR DATOS REALES AL INICIO
  useEffect(() => {
    // IMPORTANTE: Ajustamos user.id o user.dni según lo que tenga tu AuthContext
    // Si user.dni no existe, intenta con user.id o un string quemado para probar "12345678"
    const userId = user?.dni || "12345678"; 
    
    if (userId) {
      getDashboard(userId).then(data => {
        setFamilyMembers(data);
        if (data.length > 0) setSelectedMember(data[0].dni);
      });
    }
  }, [user]);

  const handleAddFamily = async () => {
    const dni = window.prompt('Ingresa el DNI del familiar:');
    const myDni = user?.dni || "12345678";

    if (dni && myDni) {
      try {
        await vincularFamiliar(dni, myDni);
        alert(`✅ Vinculación exitosa con DNI ${dni}.`);
        const newData = await getDashboard(myDni);
        setFamilyMembers(newData);
      } catch (error: any) {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  const handleRemindMedication = () => {
    alert(`🔊 Enviando mensaje de voz real...`);
  };

  const handleScheduleAppointment = () => {
    alert('📅 Conectando con API de Clínica Internacional...');
  };

  const selectedMemberData = familyMembers.find(m => m.dni === selectedMember);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-6">
        
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Mi Red de Cuidado
          </h1>
          <p className="text-secondary/60">
            Gestiona la salud de tu familia
          </p>
        </div>

        {loading && familyMembers.length === 0 && (
            <div className="flex justify-center p-8">
                <Loader className="animate-spin text-primary" />
            </div>
        )}

        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-secondary mb-1">
                Agregar Familiar
              </h3>
              <p className="text-sm text-secondary/60">
                Invita a un familiar a tu red
              </p>
            </div>
            <button
              onClick={handleAddFamily}
              disabled={loading}
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <UserPlus className="w-6 h-6 text-primary" />
            </button>
          </div>
        </Card>

        <div className="mb-6">
          <h3 className="font-semibold text-secondary mb-4">Tu Red</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <span className="text-xs text-secondary font-medium">Yo</span>
            </div>

            {familyMembers.map((member) => (
              <button
                key={member.dni}
                onClick={() => setSelectedMember(member.dni)}
                className={`flex flex-col items-center flex-shrink-0 transition-all ${
                  selectedMember === member.dni ? 'scale-110' : ''
                }`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 mb-2 ${
                  member.alerta_cronica 
                    ? 'border-primary' 
                    : 'border-green-500'
                }`}>
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                    👶
                  </div>
                </div>
                <span className="text-xs text-secondary font-medium">{member.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedMemberData && (
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary">
              Dashboard de {selectedMemberData.nombre}
            </h3>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-secondary">Signos Vitales</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary/60 mb-1">Frecuencia Cardíaca</p>
                  <p className="text-lg font-bold text-secondary">{selectedMemberData.signos_vitales?.pulso || '--'} bpm</p>
                </div>
                <div>
                  <p className="text-xs text-secondary/60 mb-1">Presión Arterial</p>
                  <p className="text-lg font-bold text-secondary">{selectedMemberData.signos_vitales?.presion || '--'}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-secondary">Adherencia a Medicación</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedMemberData.adherencia === 'VERDE' 
                    ? 'bg-green-500' 
                    : 'bg-primary'
                }`}>
                  <span className="text-2xl text-white">
                    {selectedMemberData.adherencia === 'VERDE' ? '✓' : '!'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    {selectedMemberData.adherencia === 'VERDE' 
                      ? 'Tomó su pastilla' 
                      : 'Olvidó medicación'}
                  </p>
                  <p className="text-sm text-secondary/60">Hoy</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <h4 className="font-semibold text-secondary">Póliza</h4>
                    <p className="text-sm text-secondary/60">Estado actual</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMemberData.estatus_poliza === 'Activa' 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-red-500/10 text-red-600'
                }`}>
                  {selectedMemberData.estatus_poliza || 'Desconocido'}
                </span>
              </div>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold text-secondary">Acciones Remotas</h4>
              
              <button
                onClick={handleRemindMedication}
                className="w-full p-4 bg-primary text-white rounded-xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Recordar Medicamento</span>
              </button>

              <button
                onClick={handleScheduleAppointment}
                className="w-full p-4 bg-accent text-white rounded-xl flex items-center justify-center gap-3 hover:bg-accent/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Agendar Cita</span>
              </button>
            </div>
          </div>
        )}

        {!selectedMemberData && !loading && (
          <Card className="text-center py-8">
            <p className="text-secondary/60">
              Selecciona un familiar para ver su información
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}