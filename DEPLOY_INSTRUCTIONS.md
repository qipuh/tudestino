# Instrucciones de Despliegue

## Error actual
```
Error al crear negocio: Unknown column 'hotelSubtype' in 'field list'
```

Este error ocurre porque la migración para agregar las columnas `hotelSubtype` y `hotelCategory` no se ha ejecutado en la base de datos de producción.

## Solución: Ejecutar migración en el servidor

### Opción 1: Comando completo (recomendado)
Conecta al servidor y ejecuta todo en un solo comando:

```bash
ssh root@161.132.38.151

cd /var/www/tudestino
git pull origin main
npm install
npm run build:web
node apps/api/src/migrations/add-hotel-subtype-category.js
pm2 restart tudestino-api
```

### Opción 2: Paso por paso

1. **Conectar al servidor:**
```bash
ssh root@161.132.38.151
```

2. **Ir al directorio del proyecto:**
```bash
cd /var/www/tudestino
```

3. **Actualizar código:**
```bash
git pull origin main
```

4. **Instalar dependencias (si hay cambios):**
```bash
npm install
```

5. **Construir la aplicación web:**
```bash
npm run build:web
```

6. **Ejecutar la migración:**
```bash
node apps/api/src/migrations/add-hotel-subtype-category.js
```

Deberías ver este mensaje:
```
📊 Conexión a la base de datos establecida
Agregando campos hotelSubtype y hotelCategory a tabla businesses...
✅ Campos hotelSubtype y hotelCategory agregados exitosamente
🏁 Migración completada exitosamente
```

7. **Reiniciar la API:**
```bash
pm2 restart tudestino-api
```

8. **Verificar que todo esté funcionando:**
```bash
pm2 logs tudestino-api --lines 50
```

## Verificación

Después de ejecutar la migración, intenta crear un negocio de tipo hotel nuevamente. El error debería desaparecer y deberías poder:

1. Seleccionar el tipo de negocio
2. Seleccionar el tipo de alojamiento (Hotel, Hostal, Apartment, etc.)
3. Seleccionar la categoría (estrellas, llaves, etc.)
4. Completar la descripción
5. Agregar ubicación
6. Agregar información de contacto
7. Crear el negocio exitosamente

## Cambios incluidos

✅ Formulario reorganizado en 4 pasos
✅ Selección de 15 tipos de alojamiento con Ionicons
✅ Categorías específicas para cada tipo
✅ Redes sociales actualizadas (TikTok y YouTube)
✅ Teléfono y email en una sola fila
✅ Iconos de Ionicons para tipos de negocio
