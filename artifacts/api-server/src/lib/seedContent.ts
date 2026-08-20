import { eq } from "drizzle-orm";
import { db, vaultItemsTable } from "@workspace/db";

const ABOVE_THE_NOISE_TITLE = "Above the Noise: 31 High-Impact Brand Differentiation Strategies";

/**
 * Registers supplied, immutable launch resources on every fresh database.
 * The packaged PDF is served by the Freedom Foundry web artifact; this only
 * creates the member-visible catalog record that points to it.
 */
export async function ensureLaunchContent(): Promise<void> {
  const [existing] = await db
    .select({ id: vaultItemsTable.id })
    .from(vaultItemsTable)
    .where(eq(vaultItemsTable.title, ABOVE_THE_NOISE_TITLE))
    .limit(1);

  if (existing) return;

  await db.insert(vaultItemsTable).values({
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
}