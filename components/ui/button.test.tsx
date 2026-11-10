import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("shows the cost in the accessible name before the click", () => {
    render(<Button cost="uses 1 breakdown">Break it down</Button>);
    expect(
      screen.getByRole("button", { name: "Break it down · uses 1 breakdown" }),
    ).toBeInTheDocument();
  });

  it("renders no suffix without a cost", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("is disabled when asked", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
