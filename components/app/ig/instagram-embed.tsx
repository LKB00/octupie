"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BookmarkSimple,
  ChatCircle,
  Heart,
  InstagramLogo,
  PaperPlaneTilt,
  Play,
} from "@phosphor-icons/react/dist/ssr";
import { carouselSlides } from "@/lib/data/mock/carousel";
import type { ScoredReel } from "@/lib/db/types";
import { fullNumber } from "@/lib/format";
import { Carousel } from "./carousel";
import { IgAvatar } from "./ig-avatar";

const icon =
  "flex size-9 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2";

/** Every control in Instagram's embed opens the post on Instagram; ours do exactly the same. */
function Out({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} (opens Instagram in a new tab)`}
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * A post exactly as Instagram's own embed shows it on other websites: header with View profile,
 * the media (reel, carousel or photo), View more on Instagram, the action row, likes, caption,
 * comments and "Add a comment". Like the real embed, nothing acts inside Octupie: each control
 * opens the post on Instagram.
 */
export function InstagramEmbed({ reel }: { reel: ScoredReel }) {
  const post = reel.permalink;
  const profile = `https://www.instagram.com/${reel.ownerHandle}/`;
  const caption = reel.caption.replace(/\s+/g, " ").trim();
  const slides = reel.type === "carousel" ? carouselSlides(reel.shortcode, reel.thumbnailUrl) : [];
  const [index, setIndex] = useState(0);

  return (
    <article
      aria-label={`Instagram post by ${reel.ownerHandle}`}
      className="w-full overflow-hidden rounded-md border border-border bg-surface"
    >
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        <Out href={profile} label={`${reel.ownerHandle} on Instagram`} className="shrink-0">
          <IgAvatar src={reel.owner.avatarUrl} size={32} />
        </Out>
        <div className="min-w-0 flex-1">
          <Out
            href={profile}
            label={`${reel.ownerHandle} on Instagram`}
            className="block truncate type-body-sm font-semibold hover:underline"
          >
            {reel.ownerHandle}
          </Out>
          {reel.type === "reel" ? (
            <p className="truncate type-caption text-muted">Original audio</p>
          ) : null}
        </div>
        <Out
          href={profile}
          label="View profile"
          className="shrink-0 rounded-sm bg-ig-button px-3 py-1.5 type-label text-on-brand hover:opacity-90"
        >
          View profile
        </Out>
      </header>

      {reel.type === "carousel" ? (
        <div className="relative">
          <Carousel
            slides={slides}
            index={index}
            onIndex={setIndex}
            label={`Post by ${reel.ownerHandle}`}
          />
          <span
            aria-live="polite"
            className="pointer-events-none absolute top-3 right-3 rounded-full bg-scrim px-2 py-0.5 type-caption font-semibold text-on-media"
          >
            {index + 1}/{slides.length}
          </span>
        </div>
      ) : (
        <Out
          href={post}
          label={reel.type === "reel" ? "Play this reel" : "View this post"}
          className={`group relative block w-full bg-media ${reel.type === "reel" ? "aspect-[9/16]" : "aspect-square"}`}
        >
          <Image
            src={reel.thumbnailUrl}
            alt=""
            fill
            sizes="340px"
            className="object-cover"
            priority
          />
          {reel.type === "reel" ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-scrim text-on-media transition-transform group-hover:scale-105">
                <Play aria-hidden="true" weight="fill" className="size-7 translate-x-0.5" />
              </span>
            </span>
          ) : null}
        </Out>
      )}

      <Out
        href={post}
        label="View more on Instagram"
        className="flex items-center border-b border-border px-4 py-3 type-label text-ig-blue hover:underline"
      >
        View more on Instagram
      </Out>

      <div className="flex items-center px-2 pt-1.5">
        <Out href={post} label="Like" className={icon}>
          <Heart aria-hidden="true" className="size-6" />
        </Out>
        <Out href={post} label="Comment" className={icon}>
          <ChatCircle aria-hidden="true" className="size-6 -scale-x-100" />
        </Out>
        <Out href={post} label="Share" className={icon}>
          <PaperPlaneTilt aria-hidden="true" className="size-6" />
        </Out>
        <Out href={post} label="Save" className={`${icon} ml-auto`}>
          <BookmarkSimple aria-hidden="true" className="size-6" />
        </Out>
      </div>

      <div className="flex flex-col gap-1 px-4 pb-3">
        <p className="type-body-sm font-semibold">{fullNumber(reel.likes)} likes</p>
        <p className="line-clamp-2 type-body-sm">
          <span className="font-semibold">{reel.ownerHandle}</span> {caption}
        </p>
        <Out
          href={post}
          label="View all comments"
          className="self-start type-body-sm text-muted hover:underline"
        >
          View all {fullNumber(reel.comments)} comments
        </Out>
      </div>

      <Out
        href={post}
        label="Add a comment"
        className="flex items-center gap-2 border-t border-border px-4 py-3 type-body-sm text-muted"
      >
        <span className="flex-1">Add a comment…</span>
        <InstagramLogo aria-hidden="true" className="size-5 text-text" />
      </Out>
    </article>
  );
}
