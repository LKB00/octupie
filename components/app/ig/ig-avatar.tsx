import Image from "next/image";
import { User as UserRoundIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const SIZES = {
  20: "size-5",
  24: "size-6",
  32: "size-8",
  40: "size-10",
  56: "size-14",
  88: "size-[88px]",
} as const;
export type AvatarSize = keyof typeof SIZES;

/**
 * Instagram profile photo: a circle with a hairline edge. Accounts without a photo get
 * Instagram's default: a light grey circle with a white silhouette, never initials.
 */
export function IgAvatar({
  src,
  size = 32,
  className,
  onMedia = false,
}: {
  src: string;
  size?: AvatarSize;
  className?: string;
  onMedia?: boolean;
}) {
  const box = cn(
    "relative inline-flex shrink-0 overflow-hidden rounded-full",
    SIZES[size],
    onMedia ? "ring-1 ring-on-media/70" : "ring-1 ring-border",
    className,
  );
  if (!src) {
    return (
      <span aria-hidden="true" className={cn(box, "items-end justify-center bg-border-strong")}>
        <UserRoundIcon weight="fill" className="size-[86%] translate-y-[14%] text-surface" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={box}>
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
