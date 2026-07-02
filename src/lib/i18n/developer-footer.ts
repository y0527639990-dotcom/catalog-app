export type AppLocale = "he" | "en";

export const DEVELOPER_FOOTER_EMAIL = "sales@yyautomationapp.com";

const messages = {
  he: {
    line1: "פותח ונבנה על ידי yyautomation",
    line2: "פתרונות דיגיטליים חכמים לעסקים",
    emailLabel: "לפרטים נוספים:",
  },
  en: {
    line1: "Developed by yyautomation",
    line2: "Smart digital solutions for business",
    emailLabel: "Contact us:",
  },
} as const;

export function getDeveloperFooterMessages(locale: AppLocale) {
  return messages[locale] ?? messages.he;
}

export function resolveAppLocale(lang: string | null | undefined): AppLocale {
  return lang?.toLowerCase().startsWith("en") ? "en" : "he";
}
