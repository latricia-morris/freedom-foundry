import type { BrandPowerMove, BrandPowerMoveField } from "./brandPowerMoves7to12";

type FieldWithHelper = BrandPowerMoveField & { helper?: string };
type MoveWithHelper = Omit<BrandPowerMove, "pages"> & {
  pages: readonly { title: string; fields: readonly FieldWithHelper[] }[];
};

// The source is the verbatim pdftotext-normalized extraction. This adapter keeps
// the portal's compact field contract while retaining authored helper text.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const source = require("../../../../attached_assets/power-moves-1-6.normalized.js")
  .powerMoves1to6 as readonly {
  title: string;
  pages: readonly {
    page: number;
    h: string;
    fields: readonly {
      h?: string;
      q: string;
      type: FieldWithHelper["t"];
      count?: number;
      options?: readonly string[];
      prompt?: string;
    }[];
  }[];
}[];

export const powerMoves1to6: readonly MoveWithHelper[] = source.map((move) => ({
  title: move.title.replace("Own The Identity Factor", "Own the Identity Factor"),
  pages: move.pages.map((page) => ({
    title: `Page ${page.page}: ${page.h}`,
    fields: page.fields.map((field) => ({
      p: field.q,
      t: field.type,
      ...(field.count === undefined ? {} : { n: field.count }),
      ...(field.options === undefined ? {} : { o: field.options }),
      ...(field.h === undefined && field.prompt === undefined
        ? {}
        : { helper: [field.h, field.prompt].filter(Boolean).join("\n") }),
    })),
  })),
}));