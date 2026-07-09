import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090f1d]">
      <form
        onSubmit={submitHandler}
        className="bg-white/5 p-8 rounded-3xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-white">
          Forgot Password
        </h1>

        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-white/5 text-white mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;