import { createMenuSheetTemplate } from "../../data/mundus-menu";

export function GET() {
  return new Response(createMenuSheetTemplate(), {
    headers: {
      "Content-Disposition": 'attachment; filename="mundus-menu-template.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
