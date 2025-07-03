import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Users, User, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManualMessageComposerProps {
  onMessageSent?: () => void;
}

const ManualMessageComposer: React.FC<ManualMessageComposerProps> = ({ onMessageSent }) => {
  const { user } = useAuth();
  const { data: customers = [] } = useCustomers();
  const { toast } = useToast();
  
  const [recipientType, setRecipientType] = useState<'individual' | 'broadcast'>('individual');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const customersWithEmail = customers.filter(c => c.email);
  const selectedCustomerNames = selectedCustomers.map(id => 
    customersWithEmail.find(c => c.id === id)?.full_name
  ).filter(Boolean);

  const recipientCount = recipientType === 'broadcast' 
    ? customersWithEmail.length 
    : selectedCustomers.length;

  const handleSendMessage = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === 'individual' && selectedCustomers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-manual-notification', {
        body: {
          recipientType,
          recipientIds: recipientType === 'individual' ? selectedCustomers : undefined,
          subject: subject.trim(),
          messageBody: messageBody.trim(),
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully",
        description: `Sent to ${data.successful}/${data.totalRecipients} recipients.`,
      });

      // Reset form
      setSubject('');
      setMessageBody('');
      setSelectedCustomers([]);
      setRecipientType('individual');
      
      onMessageSent?.();
    } catch (error: any) {
      console.error('Error sending manual notification:', error);
      toast({
        title: "Failed to Send Message",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Compose Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Type Selection */}
        <div className="space-y-2">
          <Label>Recipient Type</Label>
          <Select value={recipientType} onValueChange={(value: 'individual' | 'broadcast') => setRecipientType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Individual Customer(s)
                </div>
              </SelectItem>
              <SelectItem value="broadcast">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Customers (Broadcast)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Individual Customer Selection */}
        {recipientType === 'individual' && (
          <div className="space-y-2">
            <Label>Select Recipients</Label>
            <Select 
              value={selectedCustomers[selectedCustomers.length - 1] || ''} 
              onValueChange={(customerId) => {
                if (customerId && !selectedCustomers.includes(customerId)) {
                  setSelectedCustomers([...selectedCustomers, customerId]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose customers..." />
              </SelectTrigger>
              <SelectContent>
                {customersWithEmail.map(customer => (
                  <SelectItem 
                    key={customer.id} 
                    value={customer.id}
                    disabled={selectedCustomers.includes(customer.id)}
                  >
                    {customer.full_name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCustomers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCustomerNames.map((name, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {name}
                    <button
                      onClick={() => setSelectedCustomers(selectedCustomers.filter((_, i) => i !== index))}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recipient Count Display */}
        {recipientCount > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This message will be sent to <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter message subject..."
            maxLength={200}
          />
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Enter your message here..."
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {messageBody.length}/2000 characters
          </p>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!subject.trim() || !messageBody.trim() || recipientCount === 0 || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Message
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Send Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to send this message to {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}?
                  {recipientType === 'broadcast' && (
                    <span className="block mt-2 font-medium text-orange-600">
                      This will send to ALL customers with email addresses.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSendMessage} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Message"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualMessageComposer;