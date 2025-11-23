import { useState } from 'react';

type PermissionType = 'camera' | 'mic' | 'gps';
type PermissionStatus = 'granted' | 'denied' | 'prompt';

interface UsePermissionsReturn {
  permissions: Record<PermissionType, PermissionStatus>;
  request: (type: PermissionType) => Promise<PermissionStatus>;
  isRequesting: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionStatus>>({
    camera: 'prompt',
    mic: 'prompt',
    gps: 'prompt',
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const request = async (type: PermissionType): Promise<PermissionStatus> => {
    setIsRequesting(true);

    // Simular delay de petición de permiso (1 segundo)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular aprobación automática para desarrollo
    const status: PermissionStatus = 'granted';
    
    setPermissions(prev => ({
      ...prev,
      [type]: status,
    }));

    setIsRequesting(false);
    return status;
  };

  return {
    permissions,
    request,
    isRequesting,
  };
}
