import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "./segmented-control";

const OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

function Harness() {
  const [value, setValue] = useState<"7d" | "30d">("7d");
  return (
    <SegmentedControl
      aria-label="Window"
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe("SegmentedControl", () => {
  it("selects the clicked option", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "30 days" }));
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps one option selected when the current one is clicked again", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute("aria-pressed", "true");
  });
});
