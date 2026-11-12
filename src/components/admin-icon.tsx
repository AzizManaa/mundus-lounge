type IconName =
  | "book"
  | "back"
  | "scan"
  | "plus"
  | "qr"
  | "refresh"
  | "chevron"
  | "check"
  | "more";
const paths: Record<IconName, string> = {
  book: "M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2m0-16c3-2 7-2 10-1v15c-3-1-7-1-10 2",
  back: "M19 12H5m7-7-7 7 7 7",
  scan: "M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M4 12h16",
  plus: "M12 5v14M5 12h14",
  qr: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM21 15v6h-6M12 3v3m0 6h3m-3 9v-3",
  refresh:
    "M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-2L20 8M4 16l2.4 3A7 7 0 0 0 17.9 17",
  chevron: "m9 5 7 7-7 7",
  check: "m5 12 4 4L19 6",
  more: "M5 11v2m7-2v2m7-2v2",
};
export default function AdminIcon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
