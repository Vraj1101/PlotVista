import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      toast.error(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
      );
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          password,
        },
      );

      toast.success(data.message);

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
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
        <h1 className="text-3xl font-bold mb-6 text-white">Reset Password</h1>

        <input
          type="password"
          required
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/5 text-white mb-4"
        />
        <input
          type="password"
          required
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-white/5 text-white mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
