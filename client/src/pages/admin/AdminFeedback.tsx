/**
 * Admin Feedback - Geri Bildirim Yönetimi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminFeedback() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const feedbacksQuery = trpc.adminPanel.getFeedbacks.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const updateMutation = trpc.adminPanel.updateFeedbackStatus.useMutation({
    onSuccess: () => {
      toast.success("Durum güncellendi");
      feedbacksQuery.refetch();
      setSelectedFeedback(null);
    },
    onError: error => toast.error(error.message),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "complaint":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-500/20 text-red-400";
      case "suggestion":
        return "bg-[#00F5FF]/20 text-[#00F5FF]";
      case "complaint":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-yellow-500/20 text-yellow-400";
      case "in_progress":
        return "bg-[#00F5FF]/20 text-[#00F5FF]";
      case "resolved":
        return "bg-green-500/20 text-green-400";
      case "closed":
        return "bg-zinc-500/20 text-zinc-400";
      default:
        return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const handleUpdateStatus = (
    status: "new" | "in_progress" | "resolved" | "closed"
  ) => {
    if (!selectedFeedback) return;
    updateMutation.mutate({
      id: selectedFeedback.id,
      status,
      adminNotes: adminNotes || undefined,
    });
  };

  // Count by status
  const statusCounts = {
    new: feedbacksQuery.data?.filter(f => f.status === "new").length || 0,
    in_progress:
      feedbacksQuery.data?.filter(f => f.status === "in_progress").length || 0,
    resolved:
      feedbacksQuery.data?.filter(f => f.status === "resolved").length || 0,
    closed: feedbacksQuery.data?.filter(f => f.status === "closed").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter("new")}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === "new"
              ? "bg-yellow-500/20 border-yellow-500/50"
              : "bg-zinc-900/50 border-white/10 hover:border-yellow-500/30"
          }`}
        >
          <p className="text-2xl font-bold text-yellow-400">
            {statusCounts.new}
          </p>
          <p className="text-xs text-zinc-500">Yeni</p>
        </button>
        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === "in_progress"
              ? "bg-[#00F5FF]/20 border-[#00F5FF]/50"
              : "bg-zinc-900/50 border-white/10 hover:border-[#00F5FF]/30"
          }`}
        >
          <p className="text-2xl font-bold text-[#00F5FF]">
            {statusCounts.in_progress}
          </p>
          <p className="text-xs text-zinc-500">İnceleniyor</p>
        </button>
        <button
          onClick={() => setStatusFilter("resolved")}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === "resolved"
              ? "bg-green-500/20 border-green-500/50"
              : "bg-zinc-900/50 border-white/10 hover:border-green-500/30"
          }`}
        >
          <p className="text-2xl font-bold text-green-400">
            {statusCounts.resolved}
          </p>
          <p className="text-xs text-zinc-500">Çözüldü</p>
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === "all"
              ? "bg-zinc-700/50 border-zinc-500/50"
              : "bg-zinc-900/50 border-white/10 hover:border-zinc-500/30"
          }`}
        >
          <p className="text-2xl font-bold">
            {statusCounts.new +
              statusCounts.in_progress +
              statusCounts.resolved +
              statusCounts.closed}
          </p>
          <p className="text-xs text-zinc-500">Toplam</p>
        </button>
      </div>

      {/* Feedback List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {feedbacksQuery.data?.map(feedback => (
          <div
            key={feedback.id}
            className="bg-zinc-900/50 rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-[#00F5FF]/30 transition-all"
            onClick={() => {
              setSelectedFeedback(feedback);
              setAdminNotes(feedback.adminNotes || "");
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${getTypeColor(feedback.type)}`}
                >
                  {getTypeIcon(feedback.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {feedback.userName || "Anonim"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {feedback.userEmail}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    {feedback.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                    <span>
                      {format(
                        new Date(feedback.createdAt),
                        "d MMM yyyy HH:mm",
                        { locale: tr }
                      )}
                    </span>
                    {feedback.screenshotUrl && (
                      <a
                        href={feedback.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00F5FF] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ekran görüntüsü
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(feedback.type)}`}
                >
                  {feedback.type === "bug"
                    ? "Hata"
                    : feedback.type === "suggestion"
                      ? "Öneri"
                      : feedback.type === "complaint"
                        ? "Şikayet"
                        : "Diğer"}
                </span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(feedback.status)}`}
                >
                  {getStatusIcon(feedback.status)}
                  {feedback.status === "new"
                    ? "Yeni"
                    : feedback.status === "in_progress"
                      ? "İnceleniyor"
                      : feedback.status === "resolved"
                        ? "Çözüldü"
                        : "Kapatıldı"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {feedbacksQuery.data?.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Geri bildirim bulunamadı</p>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onOpenChange={() => setSelectedFeedback(null)}
      >
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle>Geri Bildirim Detayı</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${getTypeColor(selectedFeedback.type)}`}
                >
                  {getTypeIcon(selectedFeedback.type)}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedFeedback.userName || "Anonim"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {selectedFeedback.userEmail}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-sm">{selectedFeedback.description}</p>
              </div>

              {selectedFeedback.screenshotUrl && (
                <a
                  href={selectedFeedback.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#00F5FF] hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ekran görüntüsünü görüntüle
                </a>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Notu
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Notlarınız..."
                  className="bg-zinc-800 border-white/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleUpdateStatus("in_progress")}
                >
                  <Loader2 className="h-3 w-3" />
                  İnceleniyor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-green-400 hover:text-green-300"
                  onClick={() => handleUpdateStatus("resolved")}
                >
                  <CheckCircle className="h-3 w-3" />
                  Çözüldü
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-zinc-400"
                  onClick={() => handleUpdateStatus("closed")}
                >
                  <XCircle className="h-3 w-3" />
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
