import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorField } from "./ColorField";

describe("ColorField", () => {
  it("commits a valid hex on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorField label="Background" onChange={onChange} value="#101418" />);

    const hex = screen.getByRole("textbox", { name: /background hex/i });
    await user.clear(hex);
    await user.type(hex, "#ff0000");
    await user.tab();

    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  it("rejects an invalid hex on blur without committing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorField label="Background" onChange={onChange} value="#101418" />);

    const hex = screen.getByRole("textbox", { name: /background hex/i });
    await user.clear(hex);
    await user.type(hex, "nope");
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(hex).toHaveAttribute("aria-invalid", "true");
  });

  it("focuses the color input when the swatch is clicked", async () => {
    const user = userEvent.setup();
    render(<ColorField label="Background" onChange={vi.fn()} value="#101418" />);

    await user.click(screen.getByRole("button", { name: /pick background color/i }));

    expect(screen.getByLabelText(/background color picker/i)).toHaveFocus();
  });

  it("commits the native color input value", () => {
    const onChange = vi.fn();
    render(<ColorField label="Background" onChange={onChange} value="#101418" />);

    fireEvent.change(screen.getByLabelText(/background color picker/i), {
      target: { value: "#00ff00" },
    });

    expect(onChange).toHaveBeenCalledWith("#00ff00");
  });

  it("forwards an id to the field root so it can be a scroll anchor", () => {
    render(<ColorField id="lab-token-ui-muted" label="Muted" onChange={vi.fn()} value="#112233" />);

    expect(document.getElementById("lab-token-ui-muted")).toBeInTheDocument();
  });
});
