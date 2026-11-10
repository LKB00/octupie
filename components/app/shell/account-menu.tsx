"use client";

import Link from "next/link";
import {
  CaretUpDown,
  Check,
  CreditCard,
  GearSix,
  Moon,
  Plus,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { useTheme } from "@/lib/theme/use-theme";
import { IgAvatar } from "../ig/ig-avatar";
import { CollapsedHint } from "./collapsed-hint";

/**
 * The one identity control. In v1 the signed-in person and the creator they write for are the
 * same, so it shows once: the Instagram handle (what the product is about) with the plan and
 * name. Account, billing, theme, creator switching and sign out all live in this menu.
 */
export function AccountMenu({
  name,
  email,
  plan,
  creator,
}: {
  name: string;
  email: string;
  plan: string;
  creator: { igHandle: string; displayName: string; avatarUrl: string };
}) {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  return (
    <Menu>
      <MenuTrigger
        className="group/nav relative flex w-full items-center gap-2.5 rounded-[10px] p-1.5 text-left transition-colors group-data-[collapsed=true]/sidebar:mx-auto group-data-[collapsed=true]/sidebar:size-10 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:p-0 hover:bg-surface"
        aria-label={`${creator.igHandle}, ${plan} plan. Account menu`}
      >
        <IgAvatar src={creator.avatarUrl} size={32} />
        <span className="flex min-w-0 flex-1 flex-col group-data-[collapsed=true]/sidebar:hidden">
          <span className="truncate type-body-sm font-semibold">{creator.igHandle}</span>
          <span className="truncate type-caption text-muted">
            {plan} plan · {name}
          </span>
        </span>
        <CaretUpDown
          aria-hidden="true"
          className="size-4 text-muted group-data-[collapsed=true]/sidebar:hidden"
        />
        <CollapsedHint>
          {creator.igHandle} · {plan} plan
        </CollapsedHint>
      </MenuTrigger>
      <MenuContent side="top" align="start" className="w-64">
        <MenuGroup>
          <MenuLabel>
            <span className="block truncate">{name}</span>
            <span className="block truncate type-caption font-normal">{email}</span>
          </MenuLabel>
        </MenuGroup>
        <MenuLinkItem render={<Link href="/settings/profile" />}>
          <GearSix aria-hidden="true" />
          Account settings
        </MenuLinkItem>
        <MenuLinkItem render={<Link href="/settings/billing" />}>
          <CreditCard aria-hidden="true" />
          Plan &amp; billing
        </MenuLinkItem>
        <MenuItem onClick={() => setTheme(nextTheme)}>
          <Moon aria-hidden="true" />
          Appearance: {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
        </MenuItem>
        <MenuSeparator />
        <MenuGroup>
          <MenuLabel>Creators</MenuLabel>
          <MenuItem aria-current="true">
            {/* Profile picture, or IgAvatar's user silhouette when there isn't one. */}
            <IgAvatar src={creator.avatarUrl} size={20} />
            <span className="min-w-0 flex-1 truncate">
              {creator.igHandle} · {creator.displayName}
            </span>
            <Check aria-label="Current creator" className="ml-auto text-brand" />
          </MenuItem>
          <MenuItem
            onClick={() => toast.info("Agency workspaces with more creators come after v1.")}
          >
            <Plus aria-hidden="true" />
            Add creator
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem onClick={() => toast.info("Sign out is disabled in mock mode.")}>
          <SignOut aria-hidden="true" />
          Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
