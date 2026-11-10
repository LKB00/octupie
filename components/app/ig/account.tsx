import Link from "next/link";
import { cn } from "@/lib/utils";
import { IgAvatar, type AvatarSize } from "./ig-avatar";

/** An Instagram username as Instagram renders it: semibold, no "@". */
export function IgUsername({ handle, className }: { handle: string; className?: string }) {
  return <span className={cn("truncate font-semibold", className)}>{handle}</span>;
}

type RowProps = {
  handle: string;
  avatarUrl: string;
  meta?: React.ReactNode;
  href?: string;
  size?: Extract<AvatarSize, 32 | 40 | 56>;
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * One account row, the way Instagram lists accounts: photo, bold username, one muted line.
 * Used for tracked, suggested and hot accounts, the creator map panel and the reel header.
 */
export function AccountRow({
  handle,
  avatarUrl,
  meta,
  href,
  size = 40,
  trailing,
  className,
}: RowProps) {
  const body = (
    <>
      <IgAvatar src={avatarUrl} size={size} />
      <span className="flex min-w-0 flex-1 flex-col">
        <IgUsername handle={handle} className="type-body-sm text-text" />
        {meta ? <span className="truncate type-caption text-muted">{meta}</span> : null}
      </span>
    </>
  );
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {href ? (
        <Link
          href={href}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] outline-offset-4 hover:[&_.font-semibold]:underline"
        >
          {body}
        </Link>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-3">{body}</span>
      )}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}
