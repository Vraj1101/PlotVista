import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import EditProperty from "../pages/EditProperty";
import axios from "axios";
import { mockNavigate } from "../setupTests";

vi.mock("axios");

const mockPropertyResponse = {
  property: {
    _id: "mock-id-123",
    title: "Old Title",
    price: 5000000,
    description: "Old Description",
  },
  nearbyProperties: [],
};

describe("EditProperty Page GUI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("userInfo", JSON.stringify({ token: "mock-token" }));
  });

  test("loads property data and saves successfully", async () => {
    axios.get.mockResolvedValue({ data: mockPropertyResponse });
    axios.put.mockResolvedValue({ data: { message: "Property updated" } });

    render(<EditProperty />);

    // Wait for inputs to be populated
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title")).toHaveValue("Old Title");
    });

    expect(screen.getByPlaceholderText("Price")).toHaveValue(5000000);
    expect(screen.getByPlaceholderText("Description")).toHaveValue("Old Description");

    // Change title
    const titleInput = screen.getByPlaceholderText("Title");
    fireEvent.change(titleInput, { target: { value: "New Premium Land" } });

    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // Verify axios.put was called with the new values
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:5000/api/properties/mock-id-123",
        {
          title: "New Premium Land",
          price: 5000000,
          description: "Old Description",
        },
        {
          headers: {
            Authorization: "Bearer mock-token",
          },
        }
      );
    });

    // Verify redirection
    expect(mockNavigate).toHaveBeenCalledWith("/my-properties");
  });
});
