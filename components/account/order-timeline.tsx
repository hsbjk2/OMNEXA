import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

const journey = ORDER_STATUSES.filter(
  (status): status is Exclude<OrderStatus, "CANCELLED"> =>
    status !== "CANCELLED",
);

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="border border-wine/20 bg-[#f7eaea] px-4 py-3 text-[0.78rem] leading-relaxed text-wine">
        This order was cancelled. Any reserved stock has been returned to the
        catalogue.
      </div>
    );
  }

  const currentIndex = journey.indexOf(
    status as Exclude<OrderStatus, "CANCELLED">,
  );

  return (
    <ol className="relative flex justify-between gap-1">
      <span className="absolute left-3 right-3 top-3 h-px bg-line" aria-hidden />
      {journey.map((step, index) => {
        const complete = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="relative z-10 flex flex-1 flex-col items-center text-center">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[0.55rem] font-bold",
                complete
                  ? "border-forest bg-forest text-lime"
                  : "border-line bg-white text-muted/40",
                active && "ring-4 ring-lime/20",
              )}
            >
              {complete ? <Check className="size-3" strokeWidth={2.5} /> : index + 1}
            </span>
            <span
              className={cn(
                "mt-2 text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.06em]",
                complete ? "text-forest" : "text-muted/45",
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
