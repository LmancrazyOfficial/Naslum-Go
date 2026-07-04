import React from 'react';
import { format } from 'date-fns';
import { Trash2, Reply, X, Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MailView({ mail, onDelete, onClose, onReply }) {
  const date = mail.created_date ? new Date(mail.created_date) : new Date();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading font-bold text-lg flex-1 mr-4 line-clamp-1">{mail.subject || '(no subject)'}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onReply} className="rounded-full" title="Reply">
            <Reply className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="rounded-full text-destructive hover:text-destructive" title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {(mail.from_name || mail.from_email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">{mail.from_name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{mail.from_email}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{format(date, 'MMM d, yyyy')}</p>
            <p className="text-xs text-muted-foreground">{format(date, 'h:mm a')}</p>
          </div>
        </div>
        <div className="mt-2 ml-13">
          <p className="text-xs text-muted-foreground">To: <span className="text-foreground">{mail.to_email}</span></p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{mail.body}</p>
        </div>
      </div>

      {/* Reply quick action */}
      <div className="px-6 py-4 border-t border-border">
        <button
          onClick={onReply}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-medium transition-colors"
        >
          <Reply className="w-4 h-4" /> Reply to {mail.from_name || 'sender'}
        </button>
      </div>
    </div>
  );
}
