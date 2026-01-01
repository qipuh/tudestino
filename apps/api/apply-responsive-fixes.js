import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:/laragon/www/tudestino/apps/web/src/modules/properties/pages/PropertyDetail.jsx';

console.log('📝 Aplicando mejoras responsive...');

let content = readFileSync(filePath, 'utf8');

// 1. Cambiar altura responsive de la imagen principal
content = content.replace(
  'className="w-full h-[500px] bg-gray-200 rounded-b-xl overflow-hidden relative mb-4"',
  'className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200 rounded-b-xl overflow-hidden relative mb-4"'
);

// 2. Mejorar padding del overlay
content = content.replace(
  'className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6"',
  'className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 lg:p-6"'
);

// 3. Layout flex responsive en overlay
content = content.replace(
  'className="max-w-7xl mx-auto flex items-center justify-between gap-4"',
  'className="max-w-7xl mx-auto"'
);

// 4. Container responsive para info y botones
content = content.replace(
  '{/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}\n                  <div className="flex items-center gap-4 flex-1 min-w-0">',
  '<div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">\n                    {/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}\n                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">'
);

// 5. Logo responsive
content = content.replace(
  'className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/30"',
  'className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-white/30 flex-shrink-0"'
);

content = content.replace(
  'className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30"',
  'className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-2 ring-white/30 flex-shrink-0"'
);

// 6. Título responsive
content = content.replace(
  'className="text-xl font-bold text-white mb-1 truncate leading-tight drop-shadow-md"',
  'className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 leading-tight drop-shadow-md"'
);

// 7. Info items responsive
content = content.replace(
  'className="flex items-center gap-3 flex-wrap text-sm"',
  'className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm"'
);

// 8. Iconos de tamaño responsive
content = content.replace(
  /<Star size={14}/g,
  '<Star size={12}'
);
content = content.replace(
  /<Users size={14}/g,
  '<Users size={12}'
);
content = content.replace(
  /<MapPin size={13}/g,
  '<MapPin size={12}'
);

// 9. Texto "seguidores" oculto en móvil
content = content.replace(
  '<span className="text-white/70">seguidores</span>',
  '<span className="text-white/70 hidden sm:inline">seguidores</span>'
);

// 10. Botones responsive
content = content.replace(
  '{/* Lado derecho: Botones */}\n                  <div className="flex items-center gap-2">',
  '{/* Lado derecho: Botones */}\n                    <div className="flex items-center gap-1.5 sm:gap-2">'
);

// 11. Estilos de botones responsive
content = content.replace(
  'className="px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"',
  'className="px-3 py-2 sm:px-4 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center"'
);

content = content.replace(
  'className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"',
  'className="px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center"'
);

// 12. Botón seguir responsive
content = content.replace(
  'className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg flex items-center gap-2 ${',
  'className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center ${'
);

// 13. Textos de botones ocultos en móvil
content = content.replace(
  '<MessageCircle size={16} />\n                        Contactar',
  '<MessageCircle size={14} className="sm:w-4 sm:h-4" />\n                          <span className="hidden sm:inline">Contactar</span>'
);

content = content.replace(
  '<Calendar size={16} />\n                      Reservar',
  '<Calendar size={14} className="sm:w-4 sm:h-4" />\n                        <span>Reservar</span>'
);

content = content.replace(
  '<Heart size={16} className={isFollowing ? \'fill-current\' : \'\'} />\n                        {isFollowing ? \'Dejar de seguir\' : \'Seguir\'}',
  '<Heart size={14} className={`sm:w-4 sm:h-4 ${isFollowing ? \'fill-current\' : \'\'}` />\n                          <span className="hidden sm:inline">{isFollowing ? \'Dejar de seguir\' : \'Seguir\'}</span>'
);

// 14. Tabs responsive con scroll horizontal
content = content.replace(
  '<nav className="flex gap-1">',
  '<nav className="flex gap-1 overflow-x-auto scrollbar-hide">'
);

// 15. Tabs con padding reducido en móvil
content = content.replace(
  /className=\{`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2/g,
  'className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0'
);

// 16. Iconos de tabs más pequeños en móvil
content = content.replace(
  /<Home size={18} \/>/g,
  '<Home size={16} className="sm:w-4.5 sm:h-4.5" />'
);
content = content.replace(
  /<Info size={18} \/>/g,
  '<Info size={16} className="sm:w-4.5 sm:h-4.5" />'
);
content = content.replace(
  /<Sparkles size={18} \/>/g,
  '<Sparkles size={16} className="sm:w-4.5 sm:h-4.5" />'
);
content = content.replace(
  /<ImageIcon size={18} \/>/g,
  '<ImageIcon size={16} className="sm:w-4.5 sm:h-4.5" />'
);
content = content.replace(
  /<Newspaper size={18} \/>/g,
  '<Newspaper size={16} className="sm:w-4.5 sm:h-4.5" />'
);

// 17. Cerrar div del layout responsive
content = content.replace(
  '</div>\n                </div>\n              </div>\n            </div>',
  '</div>\n                  </div>\n                </div>\n              </div>\n            </div>'
);

writeFileSync(filePath, content, 'utf8');

console.log('✅ Cambios aplicados exitosamente');
process.exit(0);
