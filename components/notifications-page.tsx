"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, Mail, CheckCircle2, AlertCircle, Zap } from "lucide-react"

interface Notification {
  id: string
  type: "task" | "withdrawal" | "referral" | "admin"
  title: string
  message: string
  timestamp: number
  read: boolean
  email?: string
}

interface NotificationsPageProps {
  userEmail: string
}

export function NotificationsPage({ userEmail }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "task" | "withdrawal" | "referral" | "admin">("all")

  useEffect(() => {
    // Load notifications from localStorage
    const notificationsStr = localStorage.getItem(`notifications_${userEmail}`)
    if (notificationsStr) {
      setNotifications(JSON.parse(notificationsStr))
    }
  }, [userEmail])

  const saveNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications)
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(updatedNotifications))
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    saveNotifications(updated)
  }

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    saveNotifications(updated)
  }

  const clearAll = () => {
    saveNotifications([])
  }

  const filteredNotifications = filter === "all" ? notifications : notifications.filter((n) => n.type === filter)

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Zap className="w-5 h-5 text-accent" />
      case "withdrawal":
        return <Mail className="w-5 h-5 text-blue-400" />
      case "referral":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "admin":
        return <AlertCircle className="w-5 h-5 text-orange-400" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-accent/20 text-accent"
      case "withdrawal":
        return "bg-blue-500/20 text-blue-400"
      case "referral":
        return "bg-green-500/20 text-green-400"
      case "admin":
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "task", "withdrawal", "referral", "admin"].map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            className={filter === f ? "bg-accent text-accent-foreground" : ""}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={clearAll}
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="border-border bg-card p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
          </Card>
        ) : (
          filteredNotifications
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((notification) => (
              <Card
                key={notification.id}
                className={`border-border bg-card p-4 transition-colors ${
                  !notification.read ? "border-accent/50 bg-accent/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeBadgeColor(
                              notification.type,
                            )}`}
                          >
                            {notification.type}
                          </span>
                          {!notification.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {notification.email && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email sent to: {notification.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button onClick={() => markAsRead(notification.id)} variant="ghost" size="sm" className="text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
