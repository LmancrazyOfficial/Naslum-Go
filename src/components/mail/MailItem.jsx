import React from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function MailItem({ mail, isSelected, onClick, onStar }) {
  const date = mail.created_date ? new Date(mail.created_date) : new Date();
  const isToday = date.toDateString() === new Date().toDateString();
  const dateStr = isToday ? format(date, 'h:mm a') : format(date, 'MMM d');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors relative group
        ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/50'}
        ${!mail.is_read && !isSelected ? 'bg-primary/5' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!mail.is_read ? 'bg-primary' : 'bg-transparent'}`} />
          <span className={`text-sm truncate ${!mail.is_read ? 'font-semibold' : 'font-normal text-muted-foreground'}`}>
            {mail.from_name || mail.from_email || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{dateStr}</span>
          <button onClick={(e) => onStar(mail, e)} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Star className={`w-3.5 h-3.5 ${mail.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </div>
      <p className={`text-sm mt-0.5 truncate ${!mail.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
        {mail.subject || '(no subject)'}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">{mail.body}</p>
    </button>
  );
}
