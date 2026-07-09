import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Home from "../pages/Home";
import axios from "axios";
import { CompareProvider } from "../context/CompareContext";
import { toast } from "react-toastify";

vi.mock("axios");

const mockProperties = [
  {
    _id: "prop1",
    title: "Vraj's Special Commercial Plot",
    price: 9000000,
    address: "Ahmedabad, Gujarat",
    areaSize: 2500,
    propertyType: "commercial",
    images: ["https://example.com/image.jpg"],
  },
];

describe("Home Page GUI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  test("renders search input, search button, and saves search", async () => {
    axios.get.mockResolvedValue({ data: { properties: mockProperties } });

    render(
      <CompareProvider>
        <Home />
      </CompareProvider>
    );

    // Verify header title is present
    expect(screen.getByText(/Find the Earth/i)).toBeInTheDocument();
    
    // Check if the property title appears on screen after loading
    await waitFor(() => {
      expect(screen.getAllByText("Vraj's Special Commercial Plot")[0]).toBeInTheDocument();
    });

    // Enter a search term
    const searchInput = screen.getByPlaceholderText(/Search by city, area or property name.../i);
    fireEvent.change(searchInput, { target: { value: "Ahmedabad" } });

    // Click search button
    const searchButton = screen.getByRole("button", { name: /^Search$/ });
    fireEvent.click(searchButton);

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:5000/api/properties?search=Ahmedabad&minPrice=&maxPrice=&sort=&page=1"
    );

    // Click Save Search button
    const saveSearchButton = screen.getByRole("button", { name: /Save Search/i });
    fireEvent.click(saveSearchButton);

    // Verify localStorage has the saved search
    const savedSearches = JSON.parse(window.localStorage.getItem("savedSearches"));
    expect(savedSearches).toHaveLength(1);
    expect(savedSearches[0].searchTerm).toBe("Ahmedabad");

    // Verify Toast is called
    expect(toast.success).toHaveBeenCalledWith("Search Saved ⭐");
  });
});
