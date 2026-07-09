import { useEffect, useState } from "react";

import axios from "axios";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditProperty = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [price, setPrice] = useState("");

  const [description, setDescription] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [isDraftSubmit, setIsDraftSubmit] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/properties/${id}`,
        );

        setTitle(data.property.title);
        setPrice(data.property.price);
        setDescription(data.property.description);
        setApprovalStatus(data.property.approvalStatus || "pending");
      } catch (error) {
        console.log(error);
      }
    };

    fetchProperty();
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if(isNaN(price) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const payload = {
        title,
        price,
        description,
      };

      if (approvalStatus === "draft") {
        payload.approvalStatus = isDraftSubmit ? "draft" : "pending";
      }

      await axios.put(
        `http://localhost:5000/api/properties/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      toast.success("Property updated successfully");

      navigate("/my-properties");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update property");
      console.log("Update Error:", error.response?.data);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Edit Property</h1>

      <form onSubmit={submitHandler} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="Title"
        />

        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="Price"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 bg-white/5 rounded-xl"
          placeholder="Description"
          rows="6"
        />

        {approvalStatus === "draft" ? (
          <div className="flex gap-4">
            <button
              type="submit"
              onClick={() => setIsDraftSubmit(true)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-xl font-bold cursor-pointer transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              onClick={() => setIsDraftSubmit(false)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-lg shadow-emerald-500/10"
            >
              Publish Plot
            </button>
          </div>
        ) : (
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-xl font-bold transition cursor-pointer">
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
};

export default EditProperty;
