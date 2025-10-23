import { BED_TYPES } from '@tudestino/shared';

/**
 * Algoritmo de recomendación de habitaciones
 * Sugiere la mejor distribución de habitaciones según el número de huéspedes
 */

/**
 * Analiza las camas de una habitación
 */
const analyzeBeds = (beds) => {
  const bedAnalysis = {
    hasKing: false,
    hasQueen: false,
    hasDouble: false,
    hasSingle: false,
    hasSofaBed: false,
    hasBunkBed: false,
    totalBeds: 0,
    // Estimación de personas que pueden dormir cómodamente
    suitableForCouples: 0,
    suitableForSingles: 0,
  };

  beds.forEach(bed => {
    const count = bed.count || 0;
    bedAnalysis.totalBeds += count;

    switch (bed.type) {
      case BED_TYPES.KING:
        bedAnalysis.hasKing = true;
        bedAnalysis.suitableForCouples += count;
        break;
      case BED_TYPES.QUEEN:
        bedAnalysis.hasQueen = true;
        bedAnalysis.suitableForCouples += count;
        break;
      case BED_TYPES.DOUBLE:
        bedAnalysis.hasDouble = true;
        bedAnalysis.suitableForCouples += count;
        break;
      case BED_TYPES.SINGLE:
        bedAnalysis.hasSingle = true;
        bedAnalysis.suitableForSingles += count;
        break;
      case BED_TYPES.SOFA_BED:
        bedAnalysis.hasSofaBed = true;
        bedAnalysis.suitableForSingles += count;
        break;
      case BED_TYPES.BUNK_BED:
        bedAnalysis.hasBunkBed = true;
        bedAnalysis.suitableForSingles += count * 2; // Litera tiene 2 niveles
        break;
    }
  });

  return bedAnalysis;
};

/**
 * Calcula el score de compatibilidad de una habitación para un grupo
 */
const calculateRoomScore = (room, neededCouples, neededSingles, neededChildren) => {
  const bedAnalysis = analyzeBeds(room.beds || []);
  let score = 0;
  let reasons = [];

  // Verificar capacidad
  const totalNeeded = (neededCouples * 2) + neededSingles + neededChildren;
  if (room.guestCapacity < totalNeeded) {
    return { score: 0, reasons: ['No tiene capacidad suficiente'], bedAnalysis };
  }

  // Puntos por camas matrimoniales si hay parejas
  if (neededCouples > 0) {
    const coupleBeds = bedAnalysis.suitableForCouples;
    if (coupleBeds >= neededCouples) {
      score += 100 * neededCouples; // Bonus fuerte
      reasons.push(`Perfecta para ${neededCouples} pareja${neededCouples > 1 ? 's' : ''}`);
    } else if (coupleBeds > 0) {
      score += 50 * coupleBeds;
      reasons.push(`Cama matrimonial disponible`);
    }
  }

  // Puntos por camas individuales si hay personas solas
  if (neededSingles > 0) {
    const singleBeds = bedAnalysis.suitableForSingles;
    if (singleBeds >= neededSingles) {
      score += 80 * neededSingles;
      reasons.push(`Ideal para ${neededSingles} persona${neededSingles > 1 ? 's' : ''} independiente${neededSingles > 1 ? 's' : ''}`);
    } else if (singleBeds > 0) {
      score += 40 * singleBeds;
      reasons.push(`Camas individuales disponibles`);
    }
  }

  // Puntos por capacidad para niños
  if (neededChildren > 0) {
    if (bedAnalysis.hasBunkBed) {
      score += 60;
      reasons.push('Literas ideales para niños');
    }
    if (bedAnalysis.hasSofaBed) {
      score += 40;
      reasons.push('Sofá cama adicional');
    }
  }

  // Bonus si la capacidad es exacta o ligeramente superior
  const capacityDiff = room.guestCapacity - totalNeeded;
  if (capacityDiff === 0) {
    score += 30;
    reasons.push('Capacidad perfecta');
  } else if (capacityDiff === 1) {
    score += 20;
    reasons.push('Espacio cómodo');
  }

  // Penalización si hay mucha capacidad sobrante (desperdicio)
  if (capacityDiff > 3) {
    score -= 10;
  }

  return { score, reasons, bedAnalysis };
};

/**
 * Genera combinaciones de habitaciones
 */
const generateRoomCombinations = (rooms, maxRooms = 4) => {
  const combinations = [];

  // Solo 1 habitación
  rooms.forEach(room => {
    combinations.push([room]);
  });

  if (maxRooms >= 2) {
    // 2 habitaciones
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i; j < rooms.length; j++) {
        combinations.push([rooms[i], rooms[j]]);
      }
    }
  }

  if (maxRooms >= 3) {
    // 3 habitaciones
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i; j < rooms.length; j++) {
        for (let k = j; k < rooms.length; k++) {
          combinations.push([rooms[i], rooms[j], rooms[k]]);
        }
      }
    }
  }

  if (maxRooms >= 4) {
    // 4 habitaciones
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i; j < rooms.length; j++) {
        for (let k = j; k < rooms.length; k++) {
          for (let l = k; l < rooms.length; l++) {
            combinations.push([rooms[i], rooms[j], rooms[k], rooms[l]]);
          }
        }
      }
    }
  }

  return combinations;
};

/**
 * Recomienda habitaciones según la configuración de huéspedes
 * @param {Array} rooms - Lista de habitaciones disponibles
 * @param {number} adults - Número de adultos
 * @param {number} children - Número de niños
 * @param {Object} guestConfig - Configuración opcional { couples, singles }
 * @returns {Array} - Lista de recomendaciones ordenadas por score
 */
export const recommendRooms = (rooms, adults, children, guestConfig = null) => {
  if (!rooms || rooms.length === 0) {
    return [];
  }

  const totalGuests = adults + children;

  // Si no se especifica configuración, intentar inferir
  let neededCouples = 0;
  let neededSingles = 0;

  if (guestConfig) {
    neededCouples = guestConfig.couples || 0;
    neededSingles = guestConfig.singles || 0;
  } else {
    // Inferencia automática: asumir todos son individuales por defecto
    // Esto da más opciones de combinación y evita sobre-recomendar habitaciones grandes
    neededCouples = 0;
    neededSingles = adults;
  }

  // Filtrar habitaciones disponibles y con suficiente capacidad
  const availableRooms = rooms.filter(room => {
    // Considerar quantity: si una habitación tiene quantity > 1, está disponible múltiples veces
    return room.isAvailable !== false && room.guestCapacity >= 1;
  });

  // Expandir habitaciones según su quantity
  const expandedRooms = [];
  availableRooms.forEach(room => {
    const quantity = room.quantity || 1;
    for (let i = 0; i < quantity; i++) {
      expandedRooms.push({
        ...room,
        uniqueId: `${room.id}_${i}`,
        originalId: room.id,
        instanceNumber: i + 1,
      });
    }
  });

  // Generar combinaciones de hasta 4 habitaciones
  const maxRoomsNeeded = Math.min(Math.ceil(totalGuests / 2), 4);
  const combinations = generateRoomCombinations(expandedRooms, maxRoomsNeeded);

  // Evaluar cada combinación
  const recommendations = [];

  combinations.forEach(combination => {
    const totalCapacity = combination.reduce((sum, room) => sum + room.guestCapacity, 0);

    // Verificar que la capacidad total sea suficiente
    if (totalCapacity < totalGuests) {
      return;
    }

    // Calcular score total
    let totalScore = 0;
    let allReasons = [];
    const roomDetails = [];

    // Distribuir huéspedes entre habitaciones de la combinación
    let remainingCouples = neededCouples;
    let remainingSingles = neededSingles;
    let remainingChildren = children;

    combination.forEach((room, index) => {
      // Calcular cuántos de cada tipo asignar a esta habitación
      const couplesToAssign = Math.min(remainingCouples, 1); // Máx 1 pareja por habitación
      const singlesToAssign = Math.min(remainingSingles, room.guestCapacity - (couplesToAssign * 2));
      const childrenToAssign = Math.min(remainingChildren, room.guestCapacity - (couplesToAssign * 2) - singlesToAssign);

      const roomScore = calculateRoomScore(
        room,
        couplesToAssign,
        singlesToAssign,
        childrenToAssign
      );

      totalScore += roomScore.score;
      allReasons.push(...roomScore.reasons);

      roomDetails.push({
        room,
        couples: couplesToAssign,
        singles: singlesToAssign,
        children: childrenToAssign,
        reasons: roomScore.reasons,
        bedAnalysis: roomScore.bedAnalysis,
      });

      remainingCouples -= couplesToAssign;
      remainingSingles -= singlesToAssign;
      remainingChildren -= childrenToAssign;
    });

    // Penalización si no se pudieron acomodar todos
    if (remainingCouples > 0 || remainingSingles > 0 || remainingChildren > 0) {
      totalScore -= 1000;
    }

    // Bonus por usar menos habitaciones (más económico)
    const roomCountBonus = (4 - combination.length) * 20;
    totalScore += roomCountBonus;

    // Calcular precio total
    const totalPrice = combination.reduce((sum, room) => sum + parseFloat(room.pricePerNight || 0), 0);

    recommendations.push({
      rooms: combination,
      roomDetails,
      score: totalScore,
      totalCapacity,
      totalPrice,
      pricePerPerson: totalPrice / totalGuests,
      reasons: [...new Set(allReasons)], // Eliminar duplicados
      suitable: remainingCouples === 0 && remainingSingles === 0 && remainingChildren === 0,
    });
  });

  // Ordenar por score descendente
  recommendations.sort((a, b) => b.score - a.score);

  // Retornar top 5
  return recommendations.slice(0, 5);
};

/**
 * Genera descripción legible de la distribución
 */
export const getDistributionDescription = (roomDetails) => {
  const descriptions = roomDetails.map((detail, index) => {
    const parts = [];
    if (detail.couples > 0) {
      parts.push(`${detail.couples} pareja${detail.couples > 1 ? 's' : ''}`);
    }
    if (detail.singles > 0) {
      parts.push(`${detail.singles} persona${detail.singles > 1 ? 's' : ''} sola${detail.singles > 1 ? 's' : ''}`);
    }
    if (detail.children > 0) {
      parts.push(`${detail.children} niño${detail.children > 1 ? 's' : ''}`);
    }

    const roomLabel = detail.room.instanceNumber > 1
      ? `${detail.room.name} #${detail.room.instanceNumber}`
      : detail.room.name;

    return `**${roomLabel}**: ${parts.join(' + ')}`;
  });

  return descriptions.join('\n');
};
