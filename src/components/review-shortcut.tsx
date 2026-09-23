import { getMessages, type Locale } from "../i18n";

const reviewUrl =
  "https://search.google.com/local/writereview?placeid=ChIJFb6JfIujpBIRzbb9J7qJmlE";

export function ReviewShortcut({ locale }: { locale: Locale }) {
  return (
    <a
      className="mundus-review-shortcut"
      href={reviewUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
        <path d="m12 2.8 2.83 5.74 6.33.92-4.58 4.46 1.08 6.31L12 17.25l-5.66 2.98 1.08-6.31-4.58-4.46 6.33-.92L12 2.8Z" />
      </svg>
      <span>{getMessages(locale).reviewShortcut}</span>
    </a>
  );
}
