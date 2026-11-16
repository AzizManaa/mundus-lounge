export default function RewardIcon({ reward }: { reward: "drink" | "shisha" }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {reward === "drink" ? (
        <>
          <path d="M5 9h22L16 20 5 9Zm11 11v8m-5 0h10M18 9l5-6h5" />
          <path d="M7 5a4 4 0 0 0-4 4" />
        </>
      ) : (
        <>
          <path d="M13 4h6l-1 4h-4l-1-4Zm3 4v13m-5-10h10m-7 10c0 3-4 3-4 5 0 2 12 2 12 0 0-2-4-2-4-5m-3 0h2" />
          <path d="M18 17c10 0 11 9 5 10m-11-4c-5 0-7-2-7-5v-5m-1-4h2v4H4zM16 1v1" />
        </>
      )}
    </svg>
  );
}
