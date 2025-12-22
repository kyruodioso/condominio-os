export interface Exercise {
    id: string;
    name: string;
    description: string;
    category: 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio' | 'Full Body';
    muscles: string[];
    reps: string;
    sets: string;
    difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
}

export const EXERCISE_DB: Exercise[] = [
    // PECHO
    {
        id: 'ch1',
        name: 'Flexiones de Pecho (Push Ups)',
        description: 'Mantén el cuerpo recto y baja hasta que el pecho casi toque el suelo.',
        category: 'Pecho',
        muscles: ['Pectorales', 'Tríceps', 'Deltoides'],
        reps: '12-15',
        sets: '4',
        difficulty: 'Principiante'
    },
    {
        id: 'ch2',
        name: 'Flexiones Diamante',
        description: 'Junta las manos formando un diamante para enfocar el trabajo en tríceps y pecho interior.',
        category: 'Pecho',
        muscles: ['Tríceps', 'Pectorales'],
        reps: '10-12',
        sets: '3',
        difficulty: 'Intermedio'
    },
    {
        id: 'ch3',
        name: 'Fondos en Paralelas (Dips)',
        description: 'Baja controladamente hasta que los hombros estén debajo de los codos.',
        category: 'Pecho',
        muscles: ['Pectorales Inferiores', 'Tríceps'],
        reps: '8-12',
        sets: '4',
        difficulty: 'Intermedio'
    },

    // ESPALDA
    {
        id: 'bk1',
        name: 'Dominadas (Pull Ups)',
        description: 'Cuélgate de la barra y sube hasta pasar la barbilla. Controla la bajada.',
        category: 'Espalda',
        muscles: ['Dorsales', 'Bíceps'],
        reps: 'Al fallo',
        sets: '3',
        difficulty: 'Avanzado'
    },
    {
        id: 'bk2',
        name: 'Remo Invertido (Australian Pull Ups)',
        description: 'Usa una barra baja. Mantén el cuerpo recto y tira del pecho hacia la barra.',
        category: 'Espalda',
        muscles: ['Dorsales', 'Romboides'],
        reps: '12-15',
        sets: '4',
        difficulty: 'Principiante'
    },
    {
        id: 'bk3',
        name: 'Superman',
        description: 'Tumbado boca abajo, levanta brazos y piernas simultáneamente. Sostén 2 segundos.',
        category: 'Espalda',
        muscles: ['Lumbares'],
        reps: '15',
        sets: '3',
        difficulty: 'Principiante'
    },

    // PIERNAS
    {
        id: 'lg1',
        name: 'Sentadillas (Squats)',
        description: 'Baja las caderas como si te sentaras en una silla, manteniendo la espalda recta.',
        category: 'Piernas',
        muscles: ['Cuádriceps', 'Glúteos'],
        reps: '20',
        sets: '4',
        difficulty: 'Principiante'
    },
    {
        id: 'lg2',
        name: 'Zancadas (Lunges)',
        description: 'Da un paso largo y baja la rodilla trasera casi al suelo. Alterna piernas.',
        category: 'Piernas',
        muscles: ['Cuádriceps', 'Glúteos', 'Isquios'],
        reps: '12 por pierna',
        sets: '3',
        difficulty: 'Intermedio'
    },
    {
        id: 'lg3',
        name: 'Sentadilla Búlgara',
        description: 'Apoya un pie en un banco detrás de ti y baja con la pierna delantera.',
        category: 'Piernas',
        muscles: ['Cuádriceps', 'Glúteos'],
        reps: '10 por pierna',
        sets: '3',
        difficulty: 'Avanzado'
    },
    {
        id: 'lg4',
        name: 'Puente de Glúteo',
        description: 'Tumbado boca arriba, levanta la cadera contrayendo fuerte los glúteos.',
        category: 'Piernas',
        muscles: ['Glúteos', 'Isquios'],
        reps: '20',
        sets: '4',
        difficulty: 'Principiante'
    },

    // HOMBROS Y BRAZOS
    {
        id: 'sh1',
        name: 'Flexiones Pike',
        description: 'Forma una V invertida con tu cuerpo y flexiona los codos para bajar la cabeza.',
        category: 'Hombros',
        muscles: ['Deltoides', 'Tríceps'],
        reps: '8-12',
        sets: '3',
        difficulty: 'Intermedio'
    },
    {
        id: 'ar1',
        name: 'Fondos de Tríceps en Banco',
        description: 'Apoya las manos en un banco y baja el cuerpo flexionando los codos.',
        category: 'Brazos',
        muscles: ['Tríceps'],
        reps: '15',
        sets: '3',
        difficulty: 'Principiante'
    },

    // CORE
    {
        id: 'cr1',
        name: 'Plancha Abdominal (Plank)',
        description: 'Mantén la posición recta apoyado en antebrazos. Contrae abdomen y glúteos.',
        category: 'Core',
        muscles: ['Abdominales', 'Transverso'],
        reps: '45-60 seg',
        sets: '3',
        difficulty: 'Intermedio'
    },
    {
        id: 'cr2',
        name: 'Mountain Climbers',
        description: 'En posición de plancha, lleva las rodillas al pecho alternadamente y rápido.',
        category: 'Core',
        muscles: ['Abdominales', 'Flexores de cadera'],
        reps: '40 seg',
        sets: '3',
        difficulty: 'Intermedio'
    },
    {
        id: 'cr3',
        name: 'Russian Twists',
        description: 'Sentado con pies en el aire, gira el torso de lado a lado tocando el suelo.',
        category: 'Core',
        muscles: ['Oblicuos'],
        reps: '20',
        sets: '3',
        difficulty: 'Intermedio'
    },

    // CARDIO / FULL BODY
    {
        id: 'fb1',
        name: 'Burpees',
        description: 'Flexión, salto y palmada. El ejercicio completo por excelencia.',
        category: 'Full Body',
        muscles: ['Todo el cuerpo'],
        reps: '10-15',
        sets: '3',
        difficulty: 'Avanzado'
    },
    {
        id: 'fb2',
        name: 'Jumping Jacks',
        description: 'Saltos abriendo y cerrando piernas y brazos coordinadamente.',
        category: 'Cardio',
        muscles: ['Gemelos', 'Hombros'],
        reps: '50',
        sets: '3',
        difficulty: 'Principiante'
    }
];

export const CARDIO_OPTIONS = [
    "20 min Cinta (Ritmo moderado)",
    "15 min Elíptica (Resistencia media)",
    "10 min Saltar la soga (HIIT: 30s on / 30s off)",
    "2000m Remo (Ritmo constante)",
    "30 min Bicicleta Estática (Zona 2)",
    "15 min Escaleras (Subida constante)",
    "Tabata: 4 min (20s intenso / 10s descanso) de Burpees"
];
