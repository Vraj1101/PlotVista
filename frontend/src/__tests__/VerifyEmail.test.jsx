import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import VerifyEmail from "../pages/VerifyEmail";
import axios from "axios";
import * as router from "react-router-dom";

vi.mock("axios");

describe("VerifyEmail Page Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls verify email API on mount and shows loading state", async () => {
    vi.spyOn(router, "useParams").mockReturnValue({ token: "test-token-123" });
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves to keep it in loading

    render(<VerifyEmail />);

    expect(screen.getByText("Verifying Your Email")).toBeInTheDocument();
    expect(screen.getByText("Please wait while we activate your account...")).toBeInTheDocument();
  });

  test("renders success state when verification succeeds", async () => {
    vi.spyOn(router, "useParams").mockReturnValue({ token: "test-token-123" });
    axios.get.mockResolvedValue({
      data: { message: "Email verified successfully! You can now log in." },
    });

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(screen.getByText("Verification Successful")).toBeInTheDocument();
      expect(
        screen.getByText("Email verified successfully! You can now log in.")
      ).toBeInTheDocument();
      expect(screen.getByText("Sign In Now")).toBeInTheDocument();
    });
  });

  test("renders error state when verification fails", async () => {
    vi.spyOn(router, "useParams").mockReturnValue({ token: "test-token-123" });
    axios.get.mockRejectedValue({
      response: {
        data: { message: "The verification link is invalid or has expired." },
      },
    });

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
      expect(
        screen.getByText("The verification link is invalid or has expired.")
      ).toBeInTheDocument();
      expect(screen.getByText("Return to Signup")).toBeInTheDocument();
    });
  });
});
