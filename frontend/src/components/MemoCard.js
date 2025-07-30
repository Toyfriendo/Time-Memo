import React from 'react';
import { Calendar, Clock, Image as ImageIcon, Edit, Trash2, Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

const MemoCard = ({ memo, onEdit, onDelete, onToggleAlarm }) => {
  const formatAlarmTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isAlarmSoon = (time) => {
    const now = new Date();
    const alarmTime = new Date(time);
    const diff = alarmTime.getTime() - now.getTime();
    return diff > 0 && diff <= 24 * 60 * 60 * 1000; // Within 24 hours
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {memo.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-500" />}
            <h3 className="font-semibold text-foreground line-clamp-1">{memo.title}</h3>
          </div>
          
          {memo.alarm?.enabled && (
            <Badge 
              variant={isAlarmSoon(memo.alarm.time) ? "destructive" : "secondary"}
              className="flex items-center space-x-1"
            >
              <Bell className="w-3 h-3" />
              <span className="text-xs">{formatAlarmTime(memo.alarm.time)}</span>
            </Badge>
          )}
        </div>

        {memo.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={memo.image} 
              alt="Memo" 
              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {memo.content}
        </p>

        <div className="flex items-center text-xs text-muted-foreground space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}</span>
          </div>
          {memo.alarm?.time && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Alarm set</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(memo)}
            className="hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleAlarm(memo)}
            className={`${memo.alarm?.enabled 
              ? 'hover:bg-orange-50 dark:hover:bg-orange-950' 
              : 'hover:bg-green-50 dark:hover:bg-green-950'}`}
          >
            {memo.alarm?.enabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(memo)}
          className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemoCard;