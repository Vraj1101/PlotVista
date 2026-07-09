import { useEffect, useState } from "react";

import axios from "axios";

const MyMessages = () => {
  const [inquiries, setInquiries] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  const markAsRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      await axios.put(
        "http://localhost:5000/api/inquiries/read/buyer",
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
    } catch (error) {
      console.log("Error marking messages as read:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const { data } = await axios.get(
        "http://localhost:5000/api/inquiries/buyer",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      console.log("Buyer Messages:", data);

      setInquiries(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchMessages();
      markAsRead();
    }, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-32">
        <h2 className="text-3xl font-bold mb-4">No Conversations Yet</h2>

        <p className="text-gray-400">
          Send an inquiry to start chatting with sellers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">My Messages</h1>

      <div className="space-y-6">
        {inquiries.map((inquiry) => (
          <div key={inquiry._id} className="bg-white/5 p-6 rounded-2xl">
            <h2 className="text-xl font-bold">{inquiry.property?.title}</h2>

            <div className="mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  inquiry.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {inquiry.status.toUpperCase()}
              </span>
            </div>

            <p className="text-gray-400">Seller: {inquiry.seller?.name}</p>

            <p className="text-gray-400">
              Phone: {inquiry.seller?.phone || "Not Provided"}
            </p>
            <a
              href={`tel:${inquiry.seller?.phone}`}
              className="
    inline-block
    mt-3
    px-4
    py-2
    rounded-xl
    bg-emerald-500
    text-white
    font-bold
  "
            >
              Call Seller
            </a>

            <div className="mt-6 bg-slate-950/40 border border-white/5 rounded-3xl p-6">
              <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>💬</span> Conversation Timeline
              </h3>
              
              <div className="max-h-80 overflow-y-auto space-y-4 pr-1 mb-6 scrollbar-thin">
                {/* Initial Buyer Message (Outgoing -> Align Right) */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-none p-4 bg-cyan-500/10 border border-cyan-500/25 text-cyan-100">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-cyan-400 mb-1">
                      You (Buyer)
                    </span>
                    <p className="text-sm leading-relaxed">{inquiry.message}</p>
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
                      className={`flex ${isSeller ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 border ${
                          isSeller
                            ? "rounded-tl-none bg-slate-900 border-white/10 text-gray-200"
                            : "rounded-tr-none bg-cyan-500/10 border-cyan-500/25 text-cyan-100"
                        }`}
                      >
                        <span className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                          isSeller ? "text-emerald-400" : "text-cyan-400"
                        }`}>
                          {isSeller ? `Seller (${inquiry.seller?.name || "Owner"})` : "You (Buyer)"}
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

              {/* Reply Input */}
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
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#0c1325] border border-white/10 text-white outline-none focus:border-cyan-400 focus:bg-white/10 transition"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && replyText[inquiry._id]?.trim()) {
                      document.getElementById(`send-btn-${inquiry._id}`)?.click();
                    }
                  }}
                />
                <button
                  id={`send-btn-${inquiry._id}`}
                  onClick={async () => {
                    try {
                      if (!replyText[inquiry._id]?.trim()) return;
                      const userInfo = JSON.parse(
                        localStorage.getItem("userInfo"),
                      );

                      await axios.post(
                        `http://localhost:5000/api/inquiries/${inquiry._id}/reply`,
                        {
                          message: replyText[inquiry._id],
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                          },
                        },
                      );

                      setReplyText({
                        ...replyText,
                        [inquiry._id]: "",
                      });

                      await fetchMessages();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-2xl font-bold transition cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMessages;
