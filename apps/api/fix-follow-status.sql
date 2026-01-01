-- Script para limpiar el estado de seguimiento del negocio
-- Ejecuta esto en phpMyAdmin

-- Eliminar TODOS los seguimientos del negocio específico
DELETE FROM business_follows
WHERE businessId = '442e02f2-502f-4f00-a0a7-7651153d686b';

-- Resetear el contador de seguidores a 0
UPDATE businesses
SET followersCount = 0
WHERE id = '442e02f2-502f-4f00-a0a7-7651153d686b';

-- Verificar que se limpió correctamente
SELECT 'Registros en business_follows:' as info, COUNT(*) as count
FROM business_follows
WHERE businessId = '442e02f2-502f-4f00-a0a7-7651153d686b';

SELECT 'Datos del negocio:' as info, id, name, followersCount
FROM businesses
WHERE id = '442e02f2-502f-4f00-a0a7-7651153d686b';
