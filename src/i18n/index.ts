export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

type Messages = {
  about: {
    heading: [string, string];
    imageOneAlt: string;
    imageTwoAlt: string;
    eyebrow: string;
    firstParagraph: string;
    secondEyebrow: string;
    secondHeading: [string, string];
    secondParagraph: string;
  };
  footer: {
    call: string;
    callMundus: string;
    copyright: string;
    craftedBy: string;
    findUs: string;
    summary: string;
  };
  hero: {
    drinks: string;
    drinksLabel: string;
    eyebrow: string;
    heading: [string, string, string];
    shisha: string;
    shishaLabel: string;
    summary: string;
  };
  menu: {
    backToCategories: string;
    bottle: string;
    browseCategory: string;
    categoryList: string;
    categoryLabels: Record<string, string>;
    description: string;
    empty: string;
    eyebrow: string;
    heading: string;
    itemCount: { one: string; other: string };
    recommendation: { body: string; title: string };
    shot: string;
    title: string;
  };
  menuAtlas: {
    description: string;
    eyebrow: string;
    features: Array<{ description: string; title: string }>;
    heading: string;
    viewMenu: string;
  };
  moments: {
    description: string;
    eyebrow: string;
    heading: string;
    labels: string[];
  };
  navigation: {
    about: string;
    backHome: string;
    backToTop: string;
    contact: string;
    language: string;
    menu: string;
    primary: string;
    viewMenu: string;
    visit: string;
  };
  testimonials: {
    avatarAlt: string;
    eyebrow: string;
    heading: [string, string];
  };
  visit: {
    callMundus: string;
    closed: string;
    days: Record<string, string>;
    directions: string;
    eyebrow: string;
    heading: [string, string];
    neighbourhood: string;
    openingHours: string;
  };
};

export type MenuMessages = Messages["menu"];

const messages: Record<Locale, Messages> = {
  es: {
    about: {
      eyebrow: "Sobre nosotros",
      heading: ["Un lounge para", "buena compañía"],
      imageOneAlt: "Cazoleta de shisha encendida en Mundus Lounge",
      imageTwoAlt: "Clientes disfrutando de shisha en Mundus Lounge",
      firstParagraph:
        "Mundus es un lounge de Barcelona para desconectar, a solas o en buena compañía. Tanto si sabes lo que te gusta como si quieres una recomendación, el equipo puede ayudarte a encontrar una mezcla de sabores e intensidad que encaje contigo.",
      secondEyebrow: "Nuestro lounge",
      secondHeading: ["Bebidas, bocados y", "tu propio ritmo"],
      secondParagraph:
        "Ven por la shisha y quédate por los cócteles, la cerveza, el vino, el café o el té. La carta también incluye batidos, zumos, postres y comida informal, con hamburguesas y aperitivos para compartir.",
    },
    footer: {
      call: "LLAMA",
      callMundus: "Llama a Mundus",
      copyright: "Todos los derechos reservados.",
      craftedBy: "Creado por",
      findUs: "ENCUÉNTRANOS",
      summary: "Shisha personalizada, bebidas y comida informal en Barcelona.",
    },
    hero: {
      drinks: "Bebidas",
      drinksLabel: "CÓCTELES, CAFÉ Y TÉ",
      eyebrow: "Shisha Bar",
      heading: ["Bienvenido a", "Mundus", "Lounge"],
      shisha: "Shisha",
      shishaLabel: "SABORES PERSONALIZADOS",
      summary:
        "Un lounge relajado en el Eixample para disfrutar de shisha personalizada, cócteles, café, té y comida informal cerca de la Sagrada Família.",
    },
    menu: {
      backToCategories: "Volver a las categorías",
      bottle: "BOTELLA",
      browseCategory: "Explorar categoría del menú",
      categoryList: "Categorías de la carta",
      categoryLabels: {
        "BATIDOS & ZUMOS": "Batidos y zumos",
        "CAFÉS & TÉS": "Café y té",
        CERVEZAS: "Cervezas",
        COMBINADOS: "Combinados",
        "CÓCTELES": "Cócteles",
        FOOD: "Comida",
        POSTRES: "Postres",
        REFRESCOS: "Refrescos",
        "SHISHA EXPERIENCE": "Shisha",
        VINOS: "Vinos",
      },
      description:
        "Explora shisha, bebidas, comida y todo lo demás. Los precios se muestran en euros.",
      empty: "La carta no está disponible en este momento.",
      eyebrow: "Elige tu momento",
      heading: "La carta Mundus",
      itemCount: { one: "PRODUCTO", other: "PRODUCTOS" },
      recommendation: {
        body: "Pregunta al equipo de Mundus por una recomendación de shisha.",
        title: "¿No sabes por dónde empezar?",
      },
      shot: "CHUPITO",
      title: "Carta",
    },
    menuAtlas: {
      description:
        "Shisha personalizada, cócteles, café y té, además de comida informal para una velada sin prisas.",
      eyebrow: "Elige tu momento",
      features: [
        {
          description:
            "Una amplia gama de sabores e intensidades, con recomendaciones personalizadas del equipo.",
          title: "Shisha",
        },
        {
          description:
            "Cócteles, combinados y muchas formas de acomodarte en la noche.",
          title: "Bebidas",
        },
        {
          description: "Hamburguesas, comida informal y aperitivos para la mesa.",
          title: "Comida",
        },
      ],
      heading: "La carta Mundus",
      viewMenu: "Explora la carta completa",
    },
    moments: {
      description:
        "Shisha personalizada, bebidas y la buena compañía que hace única una noche en Mundus.",
      eyebrow: "Momentos Mundus",
      heading: "Hecho para noches sin prisas",
      labels: [
        "Ritual de shisha",
        "Cócteles",
        "Mesa de lounge",
        "Comida para compartir",
        "Después de anochecer",
        "Buena compañía",
      ],
    },
    navigation: {
      about: "Sobre nosotros",
      backHome: "Volver al inicio",
      backToTop: "Volver arriba",
      contact: "Contacto",
      language: "Idioma",
      menu: "Carta",
      primary: "Navegación principal",
      viewMenu: "Ver carta",
      visit: "Visítanos",
    },
    testimonials: {
      avatarAlt: "Foto de perfil de",
      eyebrow: "Testimonios",
      heading: ["Lo que la gente piensa", "de Mundus"],
    },
    visit: {
      callMundus: "Llama a Mundus",
      closed: "Cerrado",
      days: {
        Friday: "Viernes",
        Monday: "Lunes",
        Saturday: "Sábado",
        Sunday: "Domingo",
        Thursday: "Jueves",
        Tuesday: "Martes",
        Wednesday: "Miércoles",
      },
      directions: "Cómo llegar",
      eyebrow: "Dónde encontrarnos",
      heading: ["Tu próxima velada", "empieza en el Eixample"],
      neighbourhood: "Eixample, cerca de la Sagrada Família",
      openingHours: "Horario",
    },
  },
  en: {
    about: {
      eyebrow: "About us",
      heading: ["A lounge for", "good company"],
      imageOneAlt: "Lit shisha bowl at Mundus Lounge",
      imageTwoAlt: "Guests enjoying shisha at Mundus Lounge",
      firstParagraph:
        "Mundus is a Barcelona lounge for switching off, on your own or with good company. Whether you know what you like or want a recommendation, the team can help you find a flavour mix and intensity that feels right for you.",
      secondEyebrow: "Our lounge",
      secondHeading: ["Drinks, bites, and", "your own pace"],
      secondParagraph:
        "Come for shisha, stay for cocktails, beer, wine, coffee, or tea. The menu also covers milkshakes, juices, desserts, and casual food, including burgers and easy snacks.",
    },
    footer: {
      call: "CALL",
      callMundus: "Call Mundus",
      copyright: "All rights reserved.",
      craftedBy: "Crafted by",
      findUs: "FIND US",
      summary: "Personalised shisha, drinks, and casual food in Barcelona.",
    },
    hero: {
      drinks: "Drinks",
      drinksLabel: "COCKTAILS, COFFEE & TEA",
      eyebrow: "Shisha Bar",
      heading: ["Welcome to", "Mundus", "Lounge"],
      shisha: "Shisha",
      shishaLabel: "TAILORED FLAVOURS",
      summary:
        "A relaxed Eixample lounge for personalised shisha, cocktails, coffee, tea, and casual food near Sagrada Família.",
    },
    menu: {
      backToCategories: "Back to categories",
      bottle: "BOTTLE",
      browseCategory: "Browse menu category",
      categoryList: "Menu categories",
      categoryLabels: {
        BEERS: "Beer",
        "BATIDOS & ZUMOS": "Milkshakes & Juices",
        "CAFÉS & TÉS": "Coffee & Tea",
        CERVEZAS: "Beer",
        "COFFEES & TEAS": "Coffee & Tea",
        COCKTAILS: "Cocktails",
        COMBINED: "Spirits",
        COMBINADOS: "Spirits",
        "CÓCTELES": "Cocktails",
        DESSERTS: "Desserts",
        FOOD: "Food",
        POSTRES: "Dessert",
        REFRESCOS: "Soft drinks",
        "SHISHA EXPERIENCE": "Shisha",
        "SMOOTHIES & JUICES": "Milkshakes & Juices",
        "SOFT DRINKS": "Soft drinks",
        VINOS: "Wine",
        WINES: "Wine",
      },
      description:
        "Explore shisha, drinks, food, and everything in between. Prices are shown in euros.",
      empty: "The menu is not available right now.",
      eyebrow: "Choose your moment",
      heading: "The Mundus Menu",
      itemCount: { one: "ITEM", other: "ITEMS" },
      recommendation: {
        body: "Ask the Mundus team for a shisha recommendation.",
        title: "Not sure where to start?",
      },
      shot: "SHOT",
      title: "Menu",
    },
    menuAtlas: {
      description:
        "Personalised shisha, cocktails, coffee and tea, plus casual food for an unhurried evening.",
      eyebrow: "Choose your moment",
      features: [
        {
          description:
            "A wide range of flavours and intensity levels, with tailored advice from the team.",
          title: "Shisha",
        },
        {
          description:
            "Cocktails, mixed drinks, and plenty of ways to settle into the evening.",
          title: "Drinks",
        },
        {
          description: "Burgers, casual food, and easy snacks for the table.",
          title: "Food",
        },
      ],
      heading: "The Mundus Menu",
      viewMenu: "Explore the full menu",
    },
    moments: {
      description:
        "Personalised shisha, drinks, and the good company that makes an evening at Mundus its own.",
      eyebrow: "Mundus moments",
      heading: "Made for slow evenings",
      labels: [
        "Shisha ritual",
        "Cocktails",
        "Lounge table",
        "Food to share",
        "After dark",
        "Good company",
      ],
    },
    navigation: {
      about: "About",
      backHome: "Back to homepage",
      backToTop: "Back to top",
      contact: "Contact",
      language: "Language",
      menu: "Menu",
      primary: "Primary navigation",
      viewMenu: "View Menu",
      visit: "Visit Us",
    },
    testimonials: {
      avatarAlt: "Profile photo of",
      eyebrow: "Testimonials",
      heading: ["What people think", "about Mundus"],
    },
    visit: {
      callMundus: "Call Mundus",
      closed: "Closed",
      days: {
        Friday: "Friday",
        Monday: "Monday",
        Saturday: "Saturday",
        Sunday: "Sunday",
        Thursday: "Thursday",
        Tuesday: "Tuesday",
        Wednesday: "Wednesday",
      },
      directions: "Get directions",
      eyebrow: "Where to find us",
      heading: ["Your next slow evening", "starts in Eixample"],
      neighbourhood: "Eixample, near Sagrada Família",
      openingHours: "Opening hours",
    },
  },
};

export function getMessages(locale: Locale) {
  return messages[locale];
}
