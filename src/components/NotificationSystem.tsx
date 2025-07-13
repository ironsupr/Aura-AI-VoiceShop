import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { CommandExecutionEngine, NotificationOptions } from '../services/commandExecutionEngine';

interface Notification extends NotificationOptions {
  id: string;
  timestamp: Date;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((options: NotificationOptions) => {
    const notification: Notification = {
      ...options,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      duration: options.duration || 4000
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove non-persistent notifications
    if (!options.persistent) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Register with command execution engine
  useEffect(() => {
    CommandExecutionEngine.registerNotificationCallback(addNotification);
  }, [addNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 animate-slide-in-right ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{notification.title}</p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm opacity-90">{notification.message}</p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        if (!notification.persistent) {
                          removeNotification(notification.id);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium bg-white/80 hover:bg-white rounded transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
