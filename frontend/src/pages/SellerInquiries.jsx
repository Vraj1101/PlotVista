import { useEffect, useState } from "react";
import axios from "axios";

const SellerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const markAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/inquiries/read/seller",
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
    } catch (error) {
      console.log("Error marking inquiries as read:", error);
    }
  };

  const fetchInquiries = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/inquiries/seller",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setInquiries(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchInquiries();
      markAsRead();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markContacted = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/inquiries/${id}/contacted`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      fetchInquiries();
    } catch (error) {
      console.log(error);
    }
  };
  const sendReply = async (id) => {
    try {
      if (!replyText[id]?.trim()) return;

      await axios.post(
        `http://localhost:5000/api/inquiries/${id}/reply`,
        {
          message: replyText[id],
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setReplyText({
        ...replyText,
        [id]: "",
      });

      fetchInquiries();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-[#090f1d] text-white p-8">
      <h1 className="text-4xl font-black mb-10">📩 Seller Inquiries</h1>

      <div className="space-y-6">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry._id}
            className="bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{inquiry.buyer?.name}</h2>

                <p className="text-gray-400">{inquiry.buyer?.email}</p>

                <p className="text-gray-400">📞 {inquiry.buyer?.phone}</p>

                <a
                  href={`tel:${inquiry.buyer?.phone}`}
                  className="
    inline-block
    mt-3
    px-4
    py-2
    rounded-xl
    bg-cyan-500
    text-white
    font-bold
  "
                >
                  Call Buyer
                </a>

                <p className="mt-3 font-semibold text-cyan-400">
                  Property: {inquiry.property?.title}
                </p>
              </div>

              <div>
                <span
                  className={`px-4 py-2 rounded-full text-xs font-bold
                    ${
                      inquiry.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }
                  `}
                >
                  {inquiry.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-6 bg-slate-950/40 border border-white/5 rounded-3xl p-6">
              <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>💬</span> Conversation Timeline
              </h3>
              
              <div className="max-h-80 overflow-y-auto space-y-4 pr-1 mb-6 scrollbar-thin">
                {/* Initial Buyer Message */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-none p-4 bg-slate-900 border border-white/10">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-cyan-400 mb-1">
                      Buyer ({inquiry.buyer?.name})
                    </span>
                    <p className="text-sm text-gray-200 leading-relaxed">{inquiry.message}</p>
                    <span className="block text-right text-[9px] text-gray-500 mt-2">
                      {new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Replies */}
                {inquiry.replies?.map((reply, idx) => {
                  const isSeller = reply.senderRole === "seller";
                  return (
                    <div
                      key={reply._id || idx}
                      className={`flex ${isSeller ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 border ${
                          isSeller
                            ? "rounded-tr-none bg-emerald-500/10 border-emerald-500/25 text-emerald-100"
                            : "rounded-tl-none bg-slate-900 border-white/10 text-gray-200"
                        }`}
                      >
                        <span className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                          isSeller ? "text-emerald-400" : "text-cyan-400"
                        }`}>
                          {isSeller ? "You (Seller)" : `Buyer (${inquiry.buyer?.name})`}
                        </span>
                        <p className="text-sm leading-relaxed">{reply.message}</p>
                        {reply.createdAt && (
                          <span className="block text-right text-[9px] text-gray-500 mt-2">
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your reply here..."
                  value={replyText[inquiry._id] || ""}
                  onChange={(e) =>
                    setReplyText({
                      ...replyText,
                      [inquiry._id]: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400 focus:bg-white/10 transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendReply(inquiry._id);
                  }}
                />
                <button
                  onClick={() => sendReply(inquiry._id)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-2xl font-bold transition cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
            {inquiry.status === "pending" && (
              <button
                onClick={() => markContacted(inquiry._id)}
                className="
                  mt-5
                  px-6
                  py-3
                  rounded-xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-cyan-500
                  font-bold
                "
              >
                Mark Contacted
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerInquiries;
