import { useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data } = trpc.admin.reviews.useQuery({ page, limit: 20, status: status as any });
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateReviewStatus.useMutation({
    onSuccess: () => utils.admin.reviews.invalidate(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
      <div className="flex gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-dark">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-3">
        {data?.items.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                      review.status === "rejected" ? "bg-rose-500/10 text-rose-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>{review.status}</span>
                    {review.isVerified && <span className="text-xs text-emerald-400">Verified Purchase</span>}
                  </div>
                  <h4 className="text-white font-medium">{review.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{review.content}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  {review.status !== "approved" && (
                    <button onClick={() => updateStatus.mutate({ id: review.id, status: "approved" })} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"><CheckCircle size={14} /></button>
                  )}
                  {review.status !== "rejected" && (
                    <button onClick={() => updateStatus.mutate({ id: review.id, status: "rejected" })} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><XCircle size={14} /></button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
