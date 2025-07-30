import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '../hooks/use-toast';

const NotificationSystem = ({ memos }) => {
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const activeNotifications = [];

      memos.forEach(memo => {
        if (memo.alarm?.enabled && memo.alarm.time) {
          const alarmTime = new Date(memo.alarm.time);
          const timeDiff = alarmTime.getTime() - now.getTime();
          
          // Show notification if alarm is within 1 minute
          if (timeDiff <= 60000 && timeDiff > 0) {
            const existingNotif = notifications.find(n => n.memoId === memo.id);
            if (!existingNotif) {
              activeNotifications.push({
                id: `notif-${memo.id}-${Date.now()}`,
                memoId: memo.id,
                title: memo.title,
                message: `Reminder: ${memo.title}`,
                time: alarmTime.toISOString(),
                read: false,
                created: now.toISOString()
              });
            }
          }
        }
      });

      if (activeNotifications.length > 0) {
        setNotifications(prev => [...prev, ...activeNotifications]);
        activeNotifications.forEach(notif => {
          toast({
            title: "⏰ Time Note Reminder",
            description: notif.message,
            duration: 5000
          });
        });
      }
    };

    const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds
    checkAlarms(); // Initial check

    return () => clearInterval(interval);
  }, [memos, notifications, toast]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(-3).map(notification => (
        <Card key={notification.id} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 shadow-lg animate-in slide-in-from-right-5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationSystem;