import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle2, Clock, User, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {api} from '../lib/api';

interface Inquiry {
  id: string;
  customerName: string;
  customerContact: string;
  message: string;
  type?: 'general' | 'consultation';
  serviceRequested?: string;
  preferredDate?: string;
  status: 'unread' | 'read';
  createdAt: string;
  adminNote?: string;
}

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api('/api/db/inquiries');
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      
      const data = await res.json();
      
      // Sort by newest first (client-side fallback)
      const sorted = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInquiries(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const toggleReadStatus = async (inq: Inquiry) => {
    const newStatus = inq.status === 'unread' ? 'read' : 'unread';
    
    try {
      await api(`/api/db/inquiries/${inq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      setInquiries(prev => 
        prev.map(i => i.id === inq.id ? { ...i, status: newStatus as any } : i)
      );
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNote = async (id: string, note: string) => {
    setSavingNote(id);
    try {
      await api(`/api/db/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: note })
      });

      setInquiries(prev => 
        prev.map(i => i.id === id ? { ...i, adminNote: note } : i)
      );
      toast.success("Note saved successfully");
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(null);
    }
  };

  const handleReply = (inq: Inquiry) => {
    const contact = inq.customerContact.trim().toLowerCase();
    const isEmail = contact.includes('@') && contact.includes('.');

    const subject = `RE: ${inq.type === 'consultation' ? 'Consultation Request' : 'Inquiry'} - AU718 Gold Store`;
    
    const body = `Dear ${inq.customerName},\n\n` +
                 `Thank you for reaching out to AU718 Gold Store.\n\n` +
                 `Regarding your message:\n"${inq.message}"\n\n` +
                 `How can we assist you further?\n\n` +
                 `Best regards,\nAU718 Gold Store Team\nau718store@gmail.com`;

    if (isEmail) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      toast.success(`Opening Gmail to reply...`);
    } else {
      const phoneDigits = contact.replace(/\D/g, '');
      if (phoneDigits.length >= 8) {
        const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(body)}`;
        window.open(whatsappUrl, '_blank');
        toast.success(`Opening WhatsApp...`);
      } else {
        toast.error(`Could not determine contact method for: ${inq.customerContact}`);
      }
    }

    if (inq.status === 'unread') {
      toggleReadStatus(inq);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry permanently?")) return;

    try {
      await api(`/api/db/inquiries/${id}`, { method: 'DELETE' });
      setInquiries(inquiries.filter(i => i.id !== id));
      toast.success("Inquiry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete inquiry");
    }
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full bg-emerald-900 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-white mb-2 uppercase leading-none">Customer Leads</h1>
        <p className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Manage incoming inquiries and consultation requests</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.length > 0 ? (
          inquiries.map((inq) => (
            <Card 
              key={inq.id} 
              className={`bg-emerald-900 border-amber-400/10 overflow-hidden transition-all group ${inq.status === 'unread' ? 'border-l-4 border-l-amber-400' : 'opacity-90'}`}
            >
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-grow space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight">{inq.customerName}</h3>
                          {inq.type === 'consultation' && (
                            <Badge className="bg-amber-400 text-emerald-950 text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5">Consultation</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/50 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            {inq.customerContact.includes('@') ? <Mail size={13} className="text-amber-400" /> : <Phone size={13} className="text-amber-400" />}
                            {inq.customerContact}
                          </span>
                          {inq.serviceRequested && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400">
                                <Gem size={13} /> {inq.serviceRequested}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> 
                            {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-950/70 p-6 rounded-2xl border border-amber-400/10">
                      <p className="text-white/70 leading-relaxed italic">"{inq.message}"</p>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold mb-2 block">INTERNAL STAFF NOTE</label>
                      <textarea 
                        className="w-full bg-emerald-950 border border-amber-400/20 rounded-2xl p-4 text-sm text-white focus:border-amber-400 transition-all placeholder:text-white/30 min-h-[100px]"
                        placeholder="Add internal notes (response status, follow-up actions...)"
                        defaultValue={inq.adminNote || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (inq.adminNote || '')) {
                            handleSaveNote(inq.id, e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-3 border-t lg:border-t-0 lg:border-l border-amber-400/10 pt-6 lg:pt-0 lg:pl-8 min-w-[160px]">
                    <Button 
                      onClick={() => handleReply(inq)}
                      className="w-full gap-2 text-[10px] uppercase tracking-widest font-bold h-12 bg-amber-400 hover:bg-amber-300 text-emerald-950"
                    >
                      <Mail size={16} /> Reply
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => toggleReadStatus(inq)}
                      className={`w-full gap-2 text-[10px] uppercase tracking-widest font-bold h-10 ${
                        inq.status === 'unread' 
                          ? 'border-amber-400/30 text-amber-400 hover:bg-amber-400/10' 
                          : 'border-white/10 text-white/60'
                      }`}
                    >
                      <CheckCircle2 size={16} /> 
                      {inq.status === 'unread' ? 'Mark as Read' : 'Mark Unread'}
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(inq.id)}
                      className="w-full lg:w-12 h-10 lg:h-12 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-emerald-900 border border-amber-400/10 rounded-3xl">
            <MessageSquare size={72} className="mb-6 text-amber-400/30" />
            <h2 className="text-2xl font-serif text-white">No Inquiries Yet</h2>
            <p className="text-white/50 uppercase tracking-widest text-sm mt-2">New customer messages will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};