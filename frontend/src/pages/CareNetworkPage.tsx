import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Heart, Activity, Shield, Bell, Calendar } from 'lucide-react';
import { Card } from '../components/ui';
import { FAMILY_MEMBERS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export function CareNetworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleAddFamily = () => {
    const dni = window.prompt('Ingresa el DNI del familiar:');
    if (dni) {
      alert(`✅ Invitación enviada a DNI ${dni}. El usuario ha aceptado.`);
    }
  };

  const handleRemindMedication = () => {
    alert(`🔊 Enviando mensaje de voz: ${user?.name} te recuerda tomar tu pastilla...`);
  };

  const handleScheduleAppointment = () => {
    alert('📅 Redirigiendo a agenda del Dr...');
  };

  const selectedMemberData = FAMILY_MEMBERS.find(m => m.id === selectedMember);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
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

        {/* Sección 1: Delegación (Handshake) */}
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
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <UserPlus className="w-6 h-6 text-primary" />
            </button>
          </div>
        </Card>

        {/* Sección 2: Hub de Avatares */}
        <div className="mb-6">
          <h3 className="font-semibold text-secondary mb-4">Tu Red</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Yo */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <span className="text-xs text-secondary font-medium">Yo</span>
            </div>

            {/* Familiares */}
            {FAMILY_MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`flex flex-col items-center flex-shrink-0 transition-all ${
                  selectedMember === member.id ? 'scale-110' : ''
                }`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 mb-2 ${
                  member.status === 'Attention Needed' 
                    ? 'border-primary' 
                    : 'border-green-500'
                }`}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-secondary font-medium">{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sección 3: Dashboard de Detalle */}
        {selectedMemberData && (
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary">
              Dashboard de {selectedMemberData.name}
            </h3>

            {/* Signos Vitales */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-secondary">Signos Vitales</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary/60 mb-1">Frecuencia Cardíaca</p>
                  <p className="text-lg font-bold text-secondary">{selectedMemberData.vitals.heart}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary/60 mb-1">Presión Arterial</p>
                  <p className="text-lg font-bold text-secondary">{selectedMemberData.vitals.bp}</p>
                </div>
              </div>
            </Card>

            {/* Semáforo Adherencia */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-secondary">Adherencia a Medicación</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedMemberData.adherence === 'taken' 
                    ? 'bg-green-500' 
                    : 'bg-primary'
                }`}>
                  <span className="text-2xl">
                    {selectedMemberData.adherence === 'taken' ? '✓' : '!'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    {selectedMemberData.adherence === 'taken' 
                      ? 'Tomó su pastilla' 
                      : 'Olvidó medicación'}
                  </p>
                  <p className="text-sm text-secondary/60">Hoy, 8:00 AM</p>
                </div>
              </div>
            </Card>

            {/* Póliza */}
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <h4 className="font-semibold text-secondary">Póliza</h4>
                    <p className="text-sm text-secondary/60">Estado actual</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                  {selectedMemberData.policy}
                </span>
              </div>
            </Card>

            {/* Acciones Remotas */}
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

        {!selectedMemberData && (
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
