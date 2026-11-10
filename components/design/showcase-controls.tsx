"use client";

import { useState } from "react";
import { Sparkle as SparklesIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Chip, SelectableChip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Specimen } from "./section";

const WINDOWS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

const PILLARS = ["Pricing", "Client stories", "Behind the scenes", "Myths"];

export function ButtonsShowcase() {
  return (
    <div className="flex flex-col gap-8">
      <Specimen label="Variants">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="dark">Dark</Button>
        <Button variant="danger">Danger</Button>
      </Specimen>
      <Specimen label="Disabled">
        <Button disabled>Primary</Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="ghost" disabled>
          Ghost
        </Button>
      </Specimen>
      <Specimen label="With cost suffix (shown before the click)">
        <Button cost="uses 1 breakdown">Break it down</Button>
        <Button variant="secondary" cost="uses 1 script">
          <SparklesIcon aria-hidden="true" />
          Write my version
        </Button>
        <Button disabled cost="uses 1 breakdown">
          Break it down
        </Button>
      </Specimen>
      <Specimen label="Small">
        <Button size="sm">Save</Button>
        <Button size="sm" variant="secondary">
          Cancel
        </Button>
      </Specimen>
    </div>
  );
}

export function InputsShowcase() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="demo-handle" className="type-label text-text">
          Instagram handle
        </label>
        <Input id="demo-handle" placeholder="@yourhandle" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="demo-invalid" className="type-label text-text">
          With an error
        </label>
        <Input id="demo-invalid" defaultValue="not a handle!" aria-invalid aria-describedby="demo-invalid-msg" />
        <p id="demo-invalid-msg" className="type-label text-danger">
          Handles can only use letters, numbers, dots and underscores.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="demo-hero" className="type-label text-text">
          Hero variant
        </label>
        <Input id="demo-hero" variant="hero" placeholder="Paste your Instagram handle" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="demo-disabled" className="type-label text-text">
          Disabled
        </label>
        <Input id="demo-disabled" disabled placeholder="Not editable" />
      </div>
    </div>
  );
}

export function ChipsShowcase() {
  const [timeWindow, setTimeWindow] = useState<(typeof WINDOWS)[number]["value"]>("30d");
  return (
    <div className="flex flex-col gap-8">
      <Specimen label="Chip">
        <Chip>Talking head</Chip>
        <Chip>Carousel</Chip>
        <Chip>3 days ago</Chip>
      </Specimen>
      <Specimen label="Selectable chip">
        {PILLARS.map((pillar, i) => (
          <SelectableChip key={pillar} defaultPressed={i === 0}>
            {pillar}
          </SelectableChip>
        ))}
      </Specimen>
      <Specimen label="Segmented control (arrow keys move between options)">
        <SegmentedControl aria-label="Time window" options={WINDOWS} value={timeWindow}
          onValueChange={setTimeWindow} />
        <span className="type-label text-muted">Selected: {timeWindow}</span>
      </Specimen>
    </div>
  );
}
