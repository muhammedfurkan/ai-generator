// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Image,
  Coins,
  Gift,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type NotificationType =
  | "generation_complete"
  | "low_credits"
  | "welcome"
  | "referral_bonus"
  | "system"
  | "credit_added";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: Date;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  generation_complete: <Image className="w-5 h-5 text-[#7C3AED]" />,
  low_credits: <Coins className="w-5 h-5 text-amber-400" />,
  welcome: <Sparkles className="w-5 h-5 text-[#00F5FF]" />,
  referral_bonus: <Gift className="w-5 h-5 text-[#FF2E97]" />,
  system: <Megaphone className="w-5 h-5 text-[#00F5FF]" />,
  credit_added: <Coins className="w-5 h-5 text-green-400" />,
};

const notificationColors: Record<NotificationType, string> = {
  generation_complete: "from-[#7C3AED]/20 to-[#FF2E97]/10",
  low_credits: "from-amber-500/20 to-amber-600/10",
  welcome: "from-[#00F5FF]/20 to-[#7C3AED]/10",
  referral_bonus: "from-[#FF2E97]/20 to-[#7C3AED]/10",
  system: "from-[#00F5FF]/20 to-[#7C3AED]/10",
  credit_added: "from-green-500/20 to-green-600/10",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { data: notifications = [], refetch: refetchNotifications } =
    trpc.notification.list.useQuery(
      { limit: 20, offset: 0 },
      { refetchInterval: 30000 }
    );

  const { data: unreadCount = 0, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      refetchInterval: 15000,
    });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteMutation.mutate({ notificationId });
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full transition-all duration-300",
          "hover:bg-white/10 active:scale-95",
          isOpen && "bg-white/10"
        )}
        aria-label="Bildirimler"
      >
        <Bell
          className={cn(
            "w-5 h-5 transition-all duration-300",
            unreadCount > 0 ? "text-[#00F5FF]" : "text-gray-400"
          )}
        />

        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 flex items-center justify-center",
              "min-w-[18px] h-[18px] px-1 text-[10px] font-bold",
              "bg-red-500 text-[#F9FAFB] rounded-full"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-[min(92vw,360px)] max-h-[75vh] sm:max-h-[480px]",
            "bg-zinc-900 border border-white/10 rounded-2xl",
            "shadow-2xl shadow-black/50 overflow-hidden z-50"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-[#F9FAFB]">
              Bildirimler
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-[#00F5FF] transition-colors"
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-[#F9FAFB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(75vh-64px)] sm:max-h-[380px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm">Henüz bildirim yok</p>
                <p className="text-gray-600 text-xs mt-1">
                  Yeni bildirimler burada görünecek
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "relative px-4 py-3 cursor-pointer transition-all duration-200",
                      "hover:bg-white/5 group",
                      !notification.isRead && "bg-gradient-to-r",
                      !notification.isRead &&
                        notificationColors[notification.type]
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full",
                          "bg-white/5 flex items-center justify-center"
                        )}
                      >
                        {notificationIcons[notification.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm font-medium truncate",
                              notification.isRead
                                ? "text-gray-300"
                                : "text-[#F9FAFB]"
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00F5FF] mt-1.5" />
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs mt-0.5 line-clamp-2",
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-400"
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              markAsReadMutation.mutate({
                                notificationId: notification.id,
                              });
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-[#00F5FF] transition-colors"
                            title="Okundu işaretle"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={e => handleDelete(e, notification.id)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 pointer-events-none select-none">
              <p className="text-[10px] text-gray-500 text-center">
                Son 20 bildirim gösteriliyor
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
