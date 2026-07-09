import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "mock-id-123" }),
    Link: ({ children, to, onClick, className }) => (
      <a href={to} className={className} onClick={(e) => {
        if (onClick) onClick(e);
      }}>
        {children}
      </a>
    ),
  };
});

// Mock react-leaflet and leaflet
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMapEvents: () => null,
  useMap: () => ({
    flyTo: vi.fn(),
  }),
}));

vi.mock("leaflet", () => {
  return {
    default: {
      DivIcon: class {},
      Icon: class {},
    },
    DivIcon: class {},
    Icon: class {},
  };
});

// Mock browser storage (localStorage)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

export { mockNavigate };
