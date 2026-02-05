export type MemoryNote = {
  id: string;
  author: string;
  message: string;
  date?: string;
  colorVariant: "rose" | "peach" | "cream" | "mint";
};

export const noteColors: MemoryNote["colorVariant"][] = ["rose", "peach", "cream", "mint"];
