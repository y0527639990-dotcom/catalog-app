import {
  DEVELOPER_FOOTER_EMAIL,
  getDeveloperFooterMessages,
  type AppLocale,
} from "@/lib/i18n/developer-footer";

export default function DeveloperFooter({
  locale = "he",
}: {
  locale?: AppLocale;
}) {
  const t = getDeveloperFooterMessages(locale);

  return (
    <section
      aria-label={locale === "he" ? "חתימת מפתח" : "Developer footer"}
      className="mx-2 mb-4 mt-6 sm:mx-3"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white px-4 py-5 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/yyautomation-logo.png"
          alt="yyautomation"
          width={160}
          height={80}
          className="mx-auto h-20 w-auto max-w-full object-contain"
        />

        <p className="mt-3 text-[11px] text-gray-600">{t.line1}</p>
        <p className="mt-1 text-[11px] text-gray-500">{t.line2}</p>

        <p className="mt-2 text-xs text-gray-500">
          {t.emailLabel}{" "}
          <a
            href={`mailto:${DEVELOPER_FOOTER_EMAIL}`}
            className="text-emerald-700 underline-offset-2 hover:underline"
          >
            {DEVELOPER_FOOTER_EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}
