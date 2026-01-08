import sequelize from '../config/database-mysql.js';
import Slider from '../modules/sliders/slider.model.js';

async function syncSliderTables() {
  try {
    console.log('🔄 Sincronizando tabla de Sliders...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');

    // Sincronizar tabla (crear si no existe, sin borrar datos existentes)
    await Slider.sync({ alter: true });
    console.log('✅ Tabla Sliders sincronizada');

    console.log('\n🎉 Sincronización completada exitosamente!');

    // Verificar que existen datos
    const count = await Slider.count();
    console.log(`📊 Total de sliders en BD: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

syncSliderTables();
