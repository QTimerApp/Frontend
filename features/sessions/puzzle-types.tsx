import Image from "next/image";
import { PUZZLE_ICONS } from "@/lib/utils/puzzle-icons";
import type { PuzzleType } from "@/types/puzzle";

export const PUZZLE_TYPES: PuzzleType[] = Object.entries(PUZZLE_ICONS).map(([name, src]) => ({
  name,
  icon: () => (
    <Image
      src={src}
      alt={name}
      width={16}
      height={16}
      className="size-4"
      style={{ width: "auto", height: "auto" }}
      unoptimized
    />
  ),
}));
