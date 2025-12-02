"use client"

import { useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info } from "lucide-react"

export interface Toast {
  id: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface NotificationToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (toast.duration === 0) return

    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  const bgColor = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
    warning: "bg-yellow-500/10 border-yellow-500/20",
  }[toast.type]

  const textColor = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  }[toast.type]

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[toast.type]

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 flex items-start gap-3 max-w-sm shadow-lg animate-in fade-in slide-in-from-top-2`}
    >
      <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{toast.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{toast.message}</p>
      </div>
      <button onClick={() => onClose(toast.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <NotificationToast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
