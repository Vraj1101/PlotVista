import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const fetchProfile = async () => {
    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const { data } = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchProfile();
    }, 0);
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name can contain only letters and spaces");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    // Password validation (if password field is filled)
    if (password) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        toast.error("Password must contain uppercase, lowercase and a number");
        return;
      }
      if (!currentPassword) {
        toast.error("Please enter your current password to set a new password");
        return;
      }
    }

    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name,
          phone,
          password,
          currentPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      toast.success("Profile Updated Successfully");
      setPassword("");
      setCurrentPassword("");

      const updatedUser = {
        ...userInfo,
        name: data.name,
        phone: data.phone,
      };

      localStorage.setItem(
        "userInfo",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This will permanently erase your profile, inquiries, favorites, and property listings. This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await axios.delete("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      toast.success("Account deleted successfully");
      localStorage.removeItem("userInfo");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        My Profile
      </h1>

      <form
        onSubmit={updateProfile}
        className="space-y-4"
      >
        <input
          type="text"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="Name"
        />

        <input
          type="email"
          value={email}
          disabled
          className="w-full p-4 bg-white/10 rounded-xl"
        />

        <input
          type="tel"
          maxLength={10}
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value.replace(/\D/g, "")
            )
          }
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="Phone Number"
        />

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="New Password (Optional)"
        />

        {password && (
          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            className="w-full p-4 bg-white/5 rounded-xl border border-red-500/20 focus:border-red-500/50"
            placeholder="Current Password (Required to change password)"
            required
          />
        )}

        <button
          type="submit"
          className="bg-emerald-500 px-6 py-3 rounded-xl"
        >
          Save Changes
        </button>
      </form>

      <hr className="border-white/10 my-8" />

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-400 text-xs mb-4 leading-relaxed">
          Permanently delete your account, your property listings, active inquiries, and favorites. This action is irreversible.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-red-600/20 cursor-pointer"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;