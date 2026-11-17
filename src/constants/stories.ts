export const stories = [
  {
    id: '1',
    title: 'La aventura del bosque',
    description: 'Un paseo lleno de sorpresas.',
    emoji: '🌳',
    color: '#DDF1D8',
    sceneColor: '#E8F3E4',
    level: 'Principiante',
    pages: [
      { illustration: '🌳', sentences: ['Mora y Mailo van al bosque.', 'El sol brilla entre los árboles.'] },
      { illustration: '🐦', sentences: ['Un pájaro canta en una rama.', 'Mora y Mailo escuchan felices.'] },
      { illustration: '🍎', sentences: ['Mailo encuentra una manzana.', 'Mora la comparte con su amigo.'] },
      { illustration: '🏡', sentences: ['El cielo se pinta de rosa.', 'Mora y Mailo vuelven a casa.'] },
    ],
  },
  {
    id: '2',
    title: 'El tesoro escondido',
    description: 'Una búsqueda muy especial.',
    emoji: '🗺️',
    color: '#FCE6C8',
    sceneColor: '#FFF0D8',
    level: 'Principiante',
    pages: [
      { illustration: '🗺️', sentences: ['Mora y Mailo encuentran un mapa.', 'Tres estrellas brillan en el papel.'] },
      { illustration: '🌳', sentences: ['El mapa los guía hasta un roble.', 'Debajo de sus hojas hay una X roja.'] },
      { illustration: '🧰', sentences: ['Mailo cava junto a las raíces.', '¡Aparece una caja pequeña!'] },
      { illustration: '🌱', sentences: ['La caja guarda semillas de colores.', 'Juntos plantan su tesoro en el jardín.'] },
    ],
  },
  {
    id: '3',
    title: 'Un amigo de las estrellas',
    description: 'Una historia que viene del cielo.',
    emoji: '🚀',
    color: '#E9DFF6',
    sceneColor: '#EFE7FA',
    level: 'Principiante',
    pages: [
      { illustration: '🌠', sentences: ['Una luz cruza el cielo de noche.', 'Cae suave detrás de una colina.'] },
      { illustration: '🔭', sentences: ['Mora y Mailo siguen la luz.', 'Un lucero pequeño los saluda.'] },
      { illustration: '⭐', sentences: ['El lucero perdió su camino.', 'Los amigos le muestran el norte.'] },
      { illustration: '🌌', sentences: ['El lucero vuelve con su familia.', 'Desde el cielo, les guiña feliz.'] },
    ],
  },
  {
    id: '4',
    title: 'El misterio del jardín',
    description: 'Pequeños detectives en acción.',
    emoji: '🌻',
    color: '#F9DFE2',
    sceneColor: '#FBE8EA',
    level: 'Principiante',
    pages: [
      { illustration: '🕵️', sentences: ['Hay huellas nuevas en el jardín.', 'La regadera no está en su lugar.'] },
      { illustration: '🪴', sentences: ['Mora mira junto a las macetas.', 'Mailo encuentra pétalos amarillos.'] },
      { illustration: '🐇', sentences: ['Las huellas llegan hasta la cerca.', '¡Un conejo riega las flores!'] },
      { illustration: '🌻', sentences: ['El conejo pide disculpas.', 'Ahora los tres cuidan el jardín.'] },
    ],
  },
] as const;

export type ReadingStory = (typeof stories)[number];
