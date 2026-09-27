import { getMessages, type Locale, type MenuMessages } from "./index";

export const menuLocales = ["es", "en", "ca", "fr", "ru"] as const;
export type MenuLocale = (typeof menuLocales)[number];
export const menuLanguageNames: Record<MenuLocale, string> = {
  es: "Español", en: "English", ca: "Català", fr: "Français", ru: "Русский",
};

export function isMenuLocale(value: string): value is MenuLocale {
  return menuLocales.some((locale) => locale === value);
}

export function homeLocaleFor(locale: MenuLocale): Locale {
  return locale === "en" ? "en" : "es";
}

type MenuCopy = {
  menu: MenuMessages;
  footer: ReturnType<typeof getMessages>["footer"];
  backHome: string;
  backToTop: string;
  language: string;
  reviewShortcut: string;
};

const extraMessages: Record<Exclude<MenuLocale, Locale>, MenuCopy> = {
  ca: {
    backHome: "Torna a l’inici", backToTop: "Torna a dalt", language: "Idioma", reviewShortcut: "Deixa una ressenya",
    footer: {
      call: "TRUCA", callMundus: "Truca a Mundus", copyright: "Tots els drets reservats.",
      craftedBy: "Creat per", findUs: "TROBA’NS", instagram: "Mundus Lounge a Instagram",
      summary: "Shisha personalitzada, begudes i menjar informal a Barcelona.",
    },
    menu: {
      backToCategories: "Torna a les categories", bottle: "AMPOLLA", browseCategories: "Explora les categories",
      categoryList: "Categories de la carta", categoryLabels: {
        "SHISHA EXPERIENCE": "Shisha", "CÓCTELES": "Còctels", COMBINADOS: "Combinats", CERVEZAS: "Cerveses",
        VINOS: "Vins", "BATIDOS & ZUMOS": "Batuts i sucs", REFRESCOS: "Refrescos", FOOD: "Menjar",
        "CAFÉS & TÉS": "Cafè i te", POSTRES: "Postres",
      },
      chapters: {
        ritual: { title: "Shisha", description: "Shisha per gaudir sense presses" },
        bar: { title: "Begudes", description: "Còctels i begudes per a cada moment" },
        table: { title: "Menjar", description: "Alguna cosa per picar, cafè i un final dolç" },
      },
      closeCategories: "Tanca les categories", copyLink: "Copia l’enllaç", linkCopied: "Enllaç copiat",
      copyLinkFailed: "No s’ha pogut copiar l’enllaç", description: "Explora shisha, begudes i menjar, o ves directament a una categoria.",
      empty: "La carta no està disponible en aquest moment.", eyebrow: "Mundus Lounge", heading: "La carta Mundus",
      indexHeading: "Ves directament al teu favorit", otherCategories: "Altres categories",
      recommendation: { title: "No saps per on començar?", body: "Amb més de 200 sabors de shisha per triar, pregunta a l’equip de Mundus i t’ajudarem a trobar la teva barreja ideal." },
      shot: "XUPITO", title: "Carta",
    },
  },
  fr: {
    backHome: "Retour à l’accueil", backToTop: "Retour en haut", language: "Langue", reviewShortcut: "Laisser un avis",
    footer: {
      call: "APPELEZ", callMundus: "Appelez Mundus", copyright: "Tous droits réservés.", craftedBy: "Créé par",
      findUs: "NOUS TROUVER", instagram: "Mundus Lounge sur Instagram",
      summary: "Chicha personnalisée, boissons et cuisine décontractée à Barcelone.",
    },
    menu: {
      backToCategories: "Retour aux catégories", bottle: "BOUTEILLE", browseCategories: "Explorer les catégories",
      categoryList: "Catégories du menu", categoryLabels: {
        "SHISHA EXPERIENCE": "Chicha", "CÓCTELES": "Cocktails", COMBINADOS: "Spiritueux et mélanges", CERVEZAS: "Bières",
        VINOS: "Vins", "BATIDOS & ZUMOS": "Milkshakes et jus", REFRESCOS: "Boissons sans alcool", FOOD: "Cuisine",
        "CAFÉS & TÉS": "Café et thé", POSTRES: "Desserts",
      },
      chapters: {
        ritual: { title: "Chicha", description: "Une chicha à savourer à votre rythme" },
        bar: { title: "Boissons", description: "Cocktails et boissons pour chaque moment" },
        table: { title: "Cuisine", description: "À grignoter, un café et une touche sucrée" },
      },
      closeCategories: "Fermer les catégories", copyLink: "Copier le lien", linkCopied: "Lien copié",
      copyLinkFailed: "Impossible de copier le lien", description: "Explorez les chichas, les boissons et la cuisine, ou choisissez directement une catégorie.",
      empty: "Le menu n’est pas disponible pour le moment.", eyebrow: "Mundus Lounge", heading: "La carte Mundus",
      indexHeading: "Retrouvez vos favoris", otherCategories: "Autres catégories",
      recommendation: { title: "Vous ne savez pas par où commencer ?", body: "Avec plus de 200 saveurs de chicha au choix, demandez conseil à l’équipe Mundus pour trouver votre mélange idéal." },
      shot: "SHOT", title: "Carte",
    },
  },
  ru: {
    backHome: "На главную", backToTop: "Наверх", language: "Язык", reviewShortcut: "Оставить отзыв",
    footer: {
      call: "ПОЗВОНИТЕ", callMundus: "Позвонить в Mundus", copyright: "Все права защищены.", craftedBy: "Создано",
      findUs: "КАК НАС НАЙТИ", instagram: "Mundus Lounge в Instagram",
      summary: "Кальян по вашему вкусу, напитки и закуски в Барселоне.",
    },
    menu: {
      backToCategories: "Вернуться к категориям", bottle: "БУТЫЛКА", browseCategories: "Выбрать категорию",
      categoryList: "Категории меню", categoryLabels: {
        "SHISHA EXPERIENCE": "Кальян", "CÓCTELES": "Коктейли", COMBINADOS: "Крепкие напитки и миксы", CERVEZAS: "Пиво",
        VINOS: "Вино", "BATIDOS & ZUMOS": "Молочные коктейли и соки", REFRESCOS: "Безалкогольные напитки", FOOD: "Еда",
        "CAFÉS & TÉS": "Кофе и чай", POSTRES: "Десерты",
      },
      chapters: {
        ritual: { title: "Кальян", description: "Наслаждайтесь кальяном без спешки" },
        bar: { title: "Напитки", description: "Коктейли и напитки для любого настроения" },
        table: { title: "Еда", description: "Закуски, кофе и сладкое завершение вечера" },
      },
      closeCategories: "Закрыть категории", copyLink: "Скопировать ссылку", linkCopied: "Ссылка скопирована",
      copyLinkFailed: "Не удалось скопировать ссылку", description: "Откройте для себя кальяны, напитки и еду или сразу выберите категорию.",
      empty: "Меню сейчас недоступно.", eyebrow: "Mundus Lounge", heading: "Меню Mundus",
      indexHeading: "Сразу к любимому", otherCategories: "Другие категории",
      recommendation: { title: "Не знаете, с чего начать?", body: "У нас более 200 вкусов кальяна. Обратитесь к команде Mundus — мы поможем подобрать идеальный микс." },
      shot: "ШОТ", title: "Меню",
    },
  },
};

export function getMenuMessages(locale: MenuLocale): MenuCopy {
  if (locale === "es" || locale === "en") {
    const messages = getMessages(locale);
    return {
      menu: messages.menu, footer: messages.footer, backHome: messages.navigation.backHome,
      backToTop: messages.navigation.backToTop, language: messages.navigation.language,
      reviewShortcut: messages.reviewShortcut,
    };
  }
  return extraMessages[locale];
}
