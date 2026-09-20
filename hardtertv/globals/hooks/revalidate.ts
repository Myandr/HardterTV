import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

export const revalidateGlobalPaths =
  (paths: string[]): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };

// The footer is rendered by app/(frontend)/layout.tsx and therefore appears on
// EVERY page — revalidating a list of single paths would leave the rest stale.
export const revalidateGlobalLayout =
  (): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    revalidatePath("/", "layout");
    return doc;
  };
