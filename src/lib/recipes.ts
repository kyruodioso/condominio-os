export interface Recipe {
    id: string;
    name: string;
    image: string;
    category: string;
    instructions: string;
    ingredients: string[];
    tags: string[]; // 'bajar_peso', 'ganar_masa', 'normal'
    benefits: string; // New field for specific nutritional contribution
}

export const RECIPES: Recipe[] = [
    // Bajar Peso (Low Calorie / High Protein / Veggies)
    {
        id: 'bp1',
        name: 'Ensalada de Pollo a la Parrilla',
        image: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg',
        category: 'Bajo en Calorías',
        instructions: 'Asa la pechuga de pollo con especias. Mezcla lechuga, tomate, pepino y adereza con limón y aceite de oliva.',
        ingredients: ['1 Pechuga de Pollo', 'Lechuga Mix', '1 Tomate', '1/2 Pepino', 'Aceite de Oliva'],
        tags: ['bajar_peso'],
        benefits: 'Proteína magra de alta calidad y fibra para saciedad sin exceso de calorías.'
    },
    {
        id: 'bp2',
        name: 'Pescado al Horno con Verduras',
        image: 'https://www.themealdb.com/images/media/meals/1529445434.jpg',
        category: 'Keto Friendly',
        instructions: 'Coloca el filete de pescado en papel aluminio con calabacín y pimientos. Hornea por 20 min a 180°C.',
        ingredients: ['1 Filete de Pescado Blanco', '1 Calabacín', '1 Pimiento Rojo', 'Limón', 'Ajo en polvo'],
        tags: ['bajar_peso'],
        benefits: 'Rico en Omega-3 y antioxidantes, ideal para reducir inflamación.'
    },
    {
        id: 'bp3',
        name: 'Omelette de Claras y Espinaca',
        image: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
        category: 'Desayuno Fit',
        instructions: 'Bate las claras, saltea las espinacas y cocina en sartén antiadherente.',
        ingredients: ['4 Claras de Huevo', '1 Taza Espinacas', '1/4 Cebolla', 'Sal y Pimienta'],
        tags: ['bajar_peso'],
        benefits: 'Proteína pura de albúmina y hierro vegetal para energía sostenida.'
    },
    {
        id: 'bp4',
        name: 'Wrap de Lechuga con Pavo',
        image: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
        category: 'Low Carb',
        instructions: 'Usa hojas grandes de lechuga como tortilla. Rellena con pavo molido salteado y pico de gallo.',
        ingredients: ['Hojas de Lechuga Romana', '150g Pavo Molido', 'Tomate', 'Cebolla', 'Aguacate'],
        tags: ['bajar_peso'],
        benefits: 'Bajo índice glucémico y grasas saludables del aguacate.'
    },
    {
        id: 'bp5',
        name: 'Sopa de Verduras Detox',
        image: 'https://www.themealdb.com/images/media/meals/1529446137.jpg',
        category: 'Ligero',
        instructions: 'Hierve apio, zanahoria, cebolla y repollo en caldo de verduras. Sazona con cúrcuma.',
        ingredients: ['Apio', 'Zanahoria', 'Repollo', 'Cúrcuma', 'Caldo de Verduras'],
        tags: ['bajar_peso'],
        benefits: 'Hidratación profunda y propiedades antiinflamatorias de la cúrcuma.'
    },
    {
        id: 'bp6',
        name: 'Ceviche de Camarón',
        image: 'https://www.themealdb.com/images/media/meals/vptqpw1511798500.jpg',
        category: 'Fresco',
        instructions: 'Marina los camarones cocidos en jugo de limón con cebolla morada, cilantro y tomate.',
        ingredients: ['200g Camarones', 'Limón', 'Cebolla Morada', 'Cilantro', 'Tomate'],
        tags: ['bajar_peso'],
        benefits: 'Alto en proteína y vitamina C, estimula el metabolismo.'
    },
    {
        id: 'bp7',
        name: 'Brochetas de Pollo y Pimientos',
        image: 'https://www.themealdb.com/images/media/meals/utxryw1511721587.jpg',
        category: 'Parrilla',
        instructions: 'Intercala trozos de pollo y pimientos de colores en palitos. Asa a la parrilla.',
        ingredients: ['Pechuga de Pollo', 'Pimiento Rojo', 'Pimiento Verde', 'Cebolla', 'Especias'],
        tags: ['bajar_peso'],
        benefits: 'Vitaminas A y C de los pimientos junto a proteína limpia.'
    },

    // Ganar Masa (High Protein / Carbs)
    {
        id: 'gm1',
        name: 'Pasta con Pollo y Salsa Pesto',
        image: 'https://www.themealdb.com/images/media/meals/ursuup1487348423.jpg',
        category: 'Alto en Carbohidratos',
        instructions: 'Cocina la pasta. Saltea trozos de pollo. Mezcla todo con salsa pesto casera.',
        ingredients: ['200g Pasta Integral', '150g Pollo', 'Salsa Pesto', 'Queso Parmesano'],
        tags: ['ganar_masa'],
        benefits: 'Carbohidratos complejos para reponer glucógeno y proteína para síntesis muscular.'
    },
    {
        id: 'gm2',
        name: 'Bowl de Ternera y Arroz',
        image: 'https://www.themealdb.com/images/media/meals/z0ageb1583189511.jpg',
        category: 'Volumen Limpio',
        instructions: 'Saltea tiras de ternera con salsa de soja. Sirve sobre una cama de arroz blanco y brócoli.',
        ingredients: ['150g Ternera Magra', '1 Taza Arroz Blanco', '1 Taza Brócoli', 'Salsa de Soja'],
        tags: ['ganar_masa'],
        benefits: 'Creatina natural de la carne roja y carbohidratos de rápida absorción.'
    },
    {
        id: 'gm3',
        name: 'Batido de Proteína y Avena',
        image: 'https://www.themealdb.com/images/media/meals/1529446137.jpg',
        category: 'Post-Entreno',
        instructions: 'Licúa leche, proteína en polvo, avena y un plátano.',
        ingredients: ['1 Scoop Proteína', '1 Taza Leche', '1/2 Taza Avena', '1 Plátano', 'Mantequilla de Maní'],
        tags: ['ganar_masa'],
        benefits: 'Bomba de calorías nutritivas y aminoácidos para crecimiento rápido.'
    },
    {
        id: 'gm4',
        name: 'Burrito de Pollo y Frijoles',
        image: 'https://www.themealdb.com/images/media/meals/xxgviq1585575916.jpg',
        category: 'Energía',
        instructions: 'Rellena una tortilla grande con pollo, arroz, frijoles negros y queso.',
        ingredients: ['Tortilla de Harina', 'Pollo Desmenuzado', 'Arroz', 'Frijoles Negros', 'Queso'],
        tags: ['ganar_masa'],
        benefits: 'Combinación completa de proteínas y fibra para energía duradera.'
    },
    {
        id: 'gm5',
        name: 'Salmón con Batata (Camote)',
        image: 'https://www.themealdb.com/images/media/meals/1549542994.jpg',
        category: 'Carbos Complejos',
        instructions: 'Hornea el salmón y la batata en cubos. Sirve con espárragos.',
        ingredients: ['Filete de Salmón', '1 Batata Grande', 'Espárragos', 'Aceite de Oliva'],
        tags: ['ganar_masa'],
        benefits: 'Grasas saludables y carbohidratos de bajo índice glucémico.'
    },
    {
        id: 'gm6',
        name: 'Tortilla de Patata y Atún',
        image: 'https://www.themealdb.com/images/media/meals/vrspxv1511722107.jpg',
        category: 'Clásico',
        instructions: 'Mezcla huevos batidos con patatas cocidas y atún. Cuaja en la sartén.',
        ingredients: ['3 Huevos', '2 Patatas Medianas', '1 Lata de Atún', 'Cebolla'],
        tags: ['ganar_masa'],
        benefits: 'Proteína de alto valor biológico y potasio para recuperación.'
    },
    {
        id: 'gm7',
        name: 'Lentejas Estofadas con Chorizo',
        image: 'https://www.themealdb.com/images/media/meals/58oia61564916529.jpg',
        category: 'Potaje',
        instructions: 'Cocina lentejas con chorizo, zanahoria y patata para un plato contundente.',
        ingredients: ['Lentejas', 'Chorizo', 'Zanahoria', 'Patata', 'Caldo de Carne'],
        tags: ['ganar_masa'],
        benefits: 'Hierro, fibra y alta densidad calórica para superávit.'
    },

    // Normal / Mantenimiento
    {
        id: 'nm1',
        name: 'Tacos de Pavo Saludables',
        image: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
        category: 'Balanceado',
        instructions: 'Cocina carne molida de pavo con especias. Sirve en tortillas de maíz con pico de gallo.',
        ingredients: ['150g Pavo Molido', '3 Tortillas de Maíz', 'Tomate', 'Cebolla', 'Cilantro'],
        tags: ['normal'],
        benefits: 'Equilibrio perfecto de macronutrientes, ligero pero nutritivo.'
    },
    {
        id: 'nm2',
        name: 'Salmón con Quinoa',
        image: 'https://www.themealdb.com/images/media/meals/1549542994.jpg',
        category: 'Superalimento',
        instructions: 'A la plancha el salmón. Acompaña con quinoa cocida y aguacate.',
        ingredients: ['1 Filete Salmón', '1/2 Taza Quinoa', '1/2 Aguacate', 'Limón'],
        tags: ['normal'],
        benefits: 'Proteína completa y ácidos grasos esenciales para salud cerebral.'
    },
    {
        id: 'nm3',
        name: 'Pollo al Curry con Arroz Basmati',
        image: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
        category: 'Exótico',
        instructions: 'Cocina trozos de pollo en salsa de curry y leche de coco. Sirve con arroz.',
        ingredients: ['Pechuga de Pollo', 'Pasta de Curry', 'Leche de Coco', 'Arroz Basmati'],
        tags: ['normal'],
        benefits: 'Propiedades antioxidantes del curry y energía rápida del arroz.'
    },
    {
        id: 'nm4',
        name: 'Ensalada César con Pollo',
        image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
        category: 'Clásico',
        instructions: 'Lechuga romana, crutones, queso parmesano y pechuga de pollo a la plancha.',
        ingredients: ['Lechuga Romana', 'Pollo', 'Crutones', 'Parmesano', 'Aderezo César'],
        tags: ['normal'],
        benefits: 'Calcio del queso y proteína del pollo en un plato fresco.'
    },
    {
        id: 'nm5',
        name: 'Wok de Ternera y Vegetales',
        image: 'https://www.themealdb.com/images/media/meals/1529445309.jpg',
        category: 'Rápido',
        instructions: 'Saltea tiras de ternera a fuego alto con mix de verduras asiáticas.',
        ingredients: ['Ternera', 'Pimiento', 'Zanahoria', 'Brotes de Soja', 'Salsa de Ostras'],
        tags: ['normal'],
        benefits: 'Zinc y vitaminas del grupo B para el sistema inmune.'
    },
    {
        id: 'nm6',
        name: 'Sandwich Club Integral',
        image: 'https://www.themealdb.com/images/media/meals/xr0n4r1576788363.jpg',
        category: 'Práctico',
        instructions: 'Pan integral tostado con pechuga de pavo, lechuga, tomate y huevo duro.',
        ingredients: ['Pan Integral', 'Pechuga de Pavo', 'Huevo Duro', 'Lechuga', 'Tomate'],
        tags: ['normal'],
        benefits: 'Fibra y proteína en un formato conveniente para llevar.'
    },
    {
        id: 'nm7',
        name: 'Risotto de Champiñones',
        image: 'https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg',
        category: 'Gourmet',
        instructions: 'Arroz arborio cocinado lentamente con caldo de verduras y champiñones.',
        ingredients: ['Arroz Arborio', 'Champiñones', 'Caldo de Verduras', 'Parmesano', 'Vino Blanco'],
        tags: ['normal'],
        benefits: 'Energía reconfortante y vitamina D de los champiñones.'
    }
];
