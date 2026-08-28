import { and, eq } from "drizzle-orm";
import { db, vaultItemsTable, workbookDefinitionsTable } from "@workspace/db";
import { powerMoves1to6 } from "./brandPowerMoves1to6";
import { powerMoves7to12, type BrandPowerMove } from "./brandPowerMoves7to12";

const ABOVE_THE_NOISE_TITLE = "Above the Noise: 31 High-Impact Brand Differentiation Strategies";
const BRAND_POWER_MOVES_TITLE = "Brand Power Moves";

type SourceField = BrandPowerMove["pages"][number]["fields"][number] & {
  helper?: string;
};

type PortalField = {
  field_id: string;
  label: string;
  type: "text_short" | "text_long" | "radio" | "checkbox" | "rating" | "date";
  options?: readonly string[];
  helper_text?: string;
};

function portalFieldType(type: SourceField["t"]): PortalField["type"] {
  const types = {
    short_text: "text_short",
    long_text: "text_long",
    choice: "radio",
    checklist: "checkbox",
    rating: "rating",
    date: "date",
  } as const;
  return types[type];
}

function buildWorkbookFields(
  workbook: BrandPowerMove,
  workbookIndex: number,
): { page_id: string; title: string; fields: PortalField[] }[] {
  return workbook.pages.map((page, pageIndex) => ({
    page_id: `bpm-${workbookIndex + 1}-page-${pageIndex + 1}`,
    title: page.title,
    fields: page.fields.flatMap((field, fieldIndex) => {
      const repeatCount = field.n ?? field.labels?.length ?? 1;
      const helperText = "helper" in field && typeof field.helper === "string"
        ? field.helper
        : undefined;
      return Array.from({ length: repeatCount }, (_, repeatIndex) => ({
        field_id: `bpm-${workbookIndex + 1}-p${pageIndex + 1}-f${fieldIndex + 1}-${repeatIndex + 1}`,
        label: field.labels?.[repeatIndex]
          ?? (repeatCount === 1 ? field.p : `${field.p} ${repeatIndex + 1}`),
        type: portalFieldType(field.t),
        ...(field.o ? { options: field.o } : {}),
        ...(helperText && repeatIndex === 0
          ? { helper_text: helperText }
          : {}),
      }));
    }),
  }));
}

async function ensureVaultItem(
  values: typeof vaultItemsTable.$inferInsert,
): Promise<typeof vaultItemsTable.$inferSelect> {
  const [existing] = await db
    .select()
    .from(vaultItemsTable)
    .where(eq(vaultItemsTable.title, values.title))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(vaultItemsTable)
      .set(values)
      .where(eq(vaultItemsTable.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(vaultItemsTable).values(values).returning();
  return created;
}

/**
 * Registers supplied, immutable launch resources on every fresh database.
 * This runs safely on every API startup: catalog records retain their IDs and
 * member workbook responses remain linked to the same definitions.
 */
export async function ensureLaunchContent(): Promise<void> {
  await ensureVaultItem({
    title: ABOVE_THE_NOISE_TITLE,
    subtitle: "A practical brand-differentiation field guide",
    description: "A focused collection of 31 strategies for finding the signal in a crowded market and building a brand that cannot be ignored.",
    type: "Download",
    download_url: "/resources/above-the-noise.pdf",
    tags: ["brand strategy", "differentiation", "guide"],
    price: "0",
    status: "published",
    order: 1,
    is_featured: true,
    is_free: true,
  });

  const brandPowerMoves = await ensureVaultItem({
    title: BRAND_POWER_MOVES_TITLE,
    subtitle: "The Masters' Playbook",
    description: "Making Your Brand Your Unfair Advantage. Twelve guided workbooks for building a brand-led business with standards that hold.",
    type: "Workbook Collection",
    featured_image_url: "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/227d4a0ca_flatbookright.png",
    tags: ["brand strategy", "workbooks", "brand power moves"],
    price: "0",
    status: "published",
    order: 0,
    is_featured: true,
    is_free: false,
    access_code: "POWERMOVES",
  });

  const workbooks = [...powerMoves1to6, ...powerMoves7to12];
  for (const [index, workbook] of workbooks.entries()) {
    const values = {
      vault_item_id: brandPowerMoves.id,
      title: workbook.title,
      description: `Brand Power Moves · Workbook ${index + 1} of 12`,
      fields: buildWorkbookFields(workbook, index),
      status: "published",
      order: index + 1,
    };
    const [existing] = await db
      .select({ id: workbookDefinitionsTable.id })
      .from(workbookDefinitionsTable)
      .where(and(
        eq(workbookDefinitionsTable.vault_item_id, brandPowerMoves.id),
        eq(workbookDefinitionsTable.order, index + 1),
      ))
      .limit(1);

    if (existing) {
      await db
        .update(workbookDefinitionsTable)
        .set(values)
        .where(eq(workbookDefinitionsTable.id, existing.id));
    } else {
      await db.insert(workbookDefinitionsTable).values(values);
    }
  }
}