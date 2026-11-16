import { DRINK_TARGET, TARGET } from "../../lib/loyalty/types";
import RewardIcon from "./reward-icon";

export default function StampGrid({
  balance,
  staff = false,
}: {
  balance: number;
  staff?: boolean;
}) {
  return (
    <div
      className={staff ? "staff-stamps" : "loyalty-stamps"}
      role="img"
      aria-label={`${balance} de ${TARGET} sellos. Bebida gratis a los ${DRINK_TARGET}; shisha gratis a los ${TARGET}.`}
    >
      {Array.from({ length: TARGET }, (_, i) => {
        const position = i + 1;
        const reward =
          position === DRINK_TARGET
            ? "drink"
            : position === TARGET
              ? "shisha"
              : null;
        return (
          <span
            key={position}
            aria-hidden="true"
            className={`${position <= balance ? (staff ? "is-filled" : "filled") : ""}${reward ? " reward-stamp" : ""}`}
          >
            {reward ? (
              <RewardIcon reward={reward} />
            ) : position <= balance ? (
              "✧"
            ) : (
              position
            )}
          </span>
        );
      })}
    </div>
  );
}
