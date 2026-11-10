"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[10px] bg-surface-3 p-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "inline-flex h-8 items-center rounded-full px-4 type-label text-muted transition-colors hover:text-text",
        "data-active:bg-surface data-active:text-brand-strong data-active:shadow-selected",
        className,
      )}
      {...props}
    />
  );
}

const TabsPanel = TabsPrimitive.Panel;

export { Tabs, TabsList, TabsTab, TabsPanel };
