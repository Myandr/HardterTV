import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

export const revalidatePathsAfterChange =
  (paths: string[]): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };

export const revalidatePathsAfterDelete =
  (paths: string[]): CollectionAfterDeleteHook =>
  ({ doc, req }) => {
    if (req.context?.disableRevalidate) return doc;
    for (const path of paths) revalidatePath(path);
    return doc;
  };
