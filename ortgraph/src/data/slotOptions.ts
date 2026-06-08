/**
 * Maps each SLOT_ node to the catalog courses that can satisfy it.
 * When a student marks any of these courses as partial/total,
 * the slot is considered satisfied at that level.
 */
export const SLOT_OPTIONS: Record<string, string[]> = {
  // Sem 4 — Materia de Matemática
  SLOT_MAT: [
    '7691', // Cálculo en varias variables
    '2106', // Cálculo vectorial
    '7812', // Ecuaciones diferenciales
    '1786', // Cálculo numérico
    '7690', // Optimización con álgebra lineal
    '7689', // Tópicos avanzados y aplicados de Matemática
  ],

  // Sem 5 — Materia de Ciencias sociales
  SLOT_CS: [
    '1781', // Administración general
    '7668', // Economía y organización empresarial
    '6411', // Finanzas y valoración de proyectos
    '4266', // Ética y legislación profesional
    '1875', // Marketing de servicios
    '3835', // Sistemas contables
    '1417', // Derecho de empresa
  ],

  // Sem 6 — Materia de Sistemas inteligentes (Machine Learning)
  SLOT_ML: [
    '7349', // Machine learning para sistemas inteligentes
    '7678', // Machine learning para análisis de datos
    '7679', // Machine learning para análisis de secuencias
    '8848', // Machine learning en producción
    '8849', // Machine learning para inteligencia artificial
    '8850', // Modelos de deep learning
    '8851', // Taller de deep learning
  ],

  // Sem 6 — Materia de Comunicación y negociación (primer slot)
  SLOT_COMM: [
    '7663', // Comunicación y liderazgo
    '4266', // Ética y legislación profesional
    '7144', // English Language Communication Skills for Industry
    '7473', // Técnicas de negociación para equipos de proyecto
    '5636', // Gestión de comunicación, conflictos en proyectos
    '5906', // Habilidades de equipo en desarrollo de software
    '5733', // Habilidades gerenciales en grupos de proyectos
  ],

  // Sem 7 — Materia de Gestión de la información (Big Data)
  SLOT_BD: [
    '7692', // Fundamentos de Big Data
    '7715', // Herramientas de software para Big Data
    '7673', // Gobernanza para Big Data
    '7657', // Arquitectura de software para Big Data
    '3437', // Web mining
    '7664', // Data mining
    '3842', // Bases de datos 3
    '7466', // Bases de datos no relacionales
    '8558', // Analítica para Datawarehousing
  ],

  // Sem 7 — Materia de Seguridad informática
  SLOT_SEC: [
    '4231', // Aspectos de seguridad de sistemas informáticos
    '6147', // Seguridad en aplicaciones
    '7271', // Tecnologías aplicadas a la seguridad de la información
    '8082', // Tópicos avanzados en Seguridad
    '8149', // Implementación de seguridad en sistemas de información
    '8835', // Madurez en la Gestión de Seguridad de la Información
    '3055', // Criptografía
  ],

  // Sem 7 — Materia de Innovación y emprendedurismo
  SLOT_INN: [
    '4518', // Actitud emprendedora
    '6852', // Emprendimientos dinámicos
    '6934', // Innovación disruptiva
    '7686', // Taller de innovación y emprendedurismo
  ],

  // Sem 8 — Materia de Ingeniería de productos de software
  SLOT_PROD: [
    '7666', // Desarrollo de productos de base tecnológica
    '8420', // Modelos de negocios de software
    '7270', // Gestión avanzada de proyectos de software
    '3904', // Calidad en software
    '3935', // Prueba de software
    '5634', // Experimentación en ingeniería de software
    '6011', // Gestión de la experiencia en ingeniería de software
  ],

  // Sem 8 — Materia de nuevas tecnologías y dominios de aplicación
  SLOT_NT: [
    '9117', // AIOps
    '8931', // AI Enablement Engineering
    '8561', // Inteligencia Artificial generativa
    '7665', // Deep learning
    '6933', // Desarrollo de aplicaciones escalables en la nube
    '8559', // Fundamentos de cloud computing
    '8455', // Infraestructura en la nube 1
    '8560', // Infraestructura en la nube 2
    '7472', // Conectando cosas
    '7358', // Tecnologías para Internet de las cosas
    '5716', // Introducción a la robótica aplicada
    '4914', // Análisis de redes
    '7662', // Computación e información cuántica
    '8912', // Desarrollo de dispositivos aéreos no tripulados
  ],

  // Sem 8 — Materia de Algoritmos, Estructuras de datos y Lenguajes
  SLOT_ALG: [
    '6543', // Algoritmos, estructuras de datos y lenguajes avanzados
    '1793', // Lenguajes y compiladores
    '8562', // Programación competitiva
    '5735', // Programación con tipos dependientes
    '8834', // Programación funcional avanzada
    '7683', // Programación y análisis de sistemas paralelos y distribuidos
    '6030', // Tópicos avanzados en algoritmia
    '8454', // Ingeniería de computación de alto rendimiento
    '7825', // Cálculo Lambda
    '5330', // Teoría de tipos
  ],

  // Sem 9 — Materia de Comunicación y negociación (segundo slot)
  SLOT_COMM2: [
    '7663', // Comunicación y liderazgo
    '4266', // Ética y legislación profesional
    '7144', // English Language Communication Skills for Industry
    '7473', // Técnicas de negociación para equipos de proyecto
    '5636', // Gestión de comunicación, conflictos en proyectos
    '5906', // Habilidades de equipo en desarrollo de software
    '5733', // Habilidades gerenciales en grupos de proyectos
  ],

  // Electivas (cualquier optativa del catálogo que no sea del núcleo)
  // Vacío = se muestra todo el catálogo de electivas
  SLOT_E1: [],
  SLOT_E2: [],
  SLOT_E3: [],
};
