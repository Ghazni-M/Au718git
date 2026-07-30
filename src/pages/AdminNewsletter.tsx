import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Mail, Send, Trash2, Users, History, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { api } from '../lib/api';

interface Subscriber {
  id?: string;
  _id?: string;
  email: string;
  timestamp: string;
}

interface Campaign {
  id?: string;
  _id?: string;
  subject: string;
  content: string;
  imageUrl?: string;
  sentAt: string;
  recipientCount: number;
}

export const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    imageUrl: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subData, campData] = await Promise.all([
        api('/api/newsletter/subscribers'),
        api('/api/newsletter/campaigns')
      ]);

      setSubscribers(subData);
      setCampaigns(campData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteDialog = (id: string) => {
    setCampaignToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      await api(`/api/newsletter/campaigns/${campaignToDelete}`, { 
        method: 'DELETE' 
      });

      toast.success("Campaign deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const removeSubscriber = async (id: string) => {
    if (!id || !confirm("Remove this subscriber permanently?")) return;

    try {
      await api(`/api/newsletter/subscribers/${id}`, { method: 'DELETE' });
      toast.success("Subscriber removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove subscriber");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const result = await api('/api/upload', { 
        method: 'POST', 
        body: formDataUpload 
      });

      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      toast.success("Cover image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error("Subject and content are required");
      return;
    }

    setSending(true);
    try {
      const result = await api('/api/newsletter/send', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast.success(`Newsletter sent successfully to ${result.sentCount || subscribers.length} members!`);
      
      setIsComposing(false);
      setFormData({ subject: '', content: '', imageUrl: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const NewsletterPreview = ({ content, subject, imageUrl }: { content: string; subject: string; imageUrl?: string }) => (
    <div className="bg-white text-black p-8 rounded-2xl min-h-[400px] font-sans border border-neutral-200 overflow-auto">
      <div className="max-w-2xl mx-auto">
        {imageUrl && <img src={imageUrl} alt="Banner" className="w-full h-64 object-cover rounded-xl mb-8" />}
        <div className="text-center mb-8">
          <span className="text-2xl font-serif font-bold tracking-tighter">AU718 GOLD</span>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-8 text-center">{subject}</h1>
        <div 
          className="prose prose-neutral max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content || "<p>No content provided...</p>" }}
        />
      </div>
    </div>
  );

  if (loading) return <Skeleton className="h-[600px] w-full" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white">Inner Circle Comms</h1>
          <p className="text-white/50">Exclusive Audience & Campaign Management</p>
        </div>

        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger>
            <Button className="gold-gradient text-black font-bold uppercase tracking-widest px-8 py-6">
              <Send size={16} className="mr-2" />
              COMPOSE NEW CAMPAIGN
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-5xl bg-neutral-950 border-gold/30 text-white max-h-[92vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b border-white/10">
              <DialogTitle className="text-2xl font-serif">Create Elite Newsletter</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="New arrivals • Limited 24K collection"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="preview" className="h-24 w-full object-cover rounded" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Email Content (HTML Supported)</Label>
                  <Tabs defaultValue="editor">
                    <TabsList>
                      <TabsTrigger value="editor">Editor</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="editor">
                      <textarea
                        className="w-full h-96 bg-neutral-900 border border-white/20 rounded-lg p-4 text-white font-mono resize-y"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your newsletter..."
                        required
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <NewsletterPreview 
                        content={formData.content} 
                        subject={formData.subject} 
                        imageUrl={formData.imageUrl} 
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <DialogFooter className="p-6 border-t border-white/10 bg-neutral-900">
                <Button type="submit" disabled={sending} className="w-full gold-gradient text-black py-6 text-base font-bold">
                  {sending ? "Sending..." : `Send to ${subscribers.length} Members`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subscribers */}
        <Card className="lg:col-span-5 bg-neutral-950 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Users className="text-gold" /> Inner Circle ({subscribers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[580px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Email Address</TableHead>
                    <TableHead className="text-gold text-right">Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length > 0 ? (
                    subscribers.map((sub) => {
                      const id = sub._id || sub.id;
                      return (
                        <TableRow key={id || sub.email} className="hover:bg-white/5">
                          <TableCell className="font-medium text-white">{sub.email}</TableCell>
                          <TableCell className="text-right text-white/60">
                            {new Date(sub.timestamp).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell>
                            {id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeSubscriber(id)} 
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-16 text-white/40">
                        <Mail size={48} className="mx-auto mb-4 opacity-50" />
                        No subscribers yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign History */}
        <Card className="lg:col-span-7 bg-neutral-950 border-white/10">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-3 text-xl">
              <History className="text-gold" /> Campaign History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                <p>No campaigns sent yet</p>
              </div>
            ) : (
              campaigns.map((camp) => {
                const campId = camp._id || camp.id;
                return (
                  <div 
                    key={campId} 
                    className="p-6 border border-white/10 rounded-2xl mb-4 hover:border-gold/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-emerald-500/20 text-emerald-400">Delivered</Badge>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50">
                          {new Date(camp.sentAt).toLocaleString()}
                        </span>
                        {campId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(campId)}
                            className="text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-gold font-bold text-lg mb-2">{camp.subject}</h3>
                    <p className="text-white/70 line-clamp-2 mb-2">{camp.content}</p>
                    {camp.recipientCount && (
                      <p className="text-xs text-white/50">
                        Sent to {camp.recipientCount} recipients
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              Delete Campaign
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-white/80">
            Are you sure you want to permanently delete this campaign from history?<br />
            <span className="text-red-400 font-medium">This action cannot be undone.</span>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCampaign}
            >
              Yes, Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNewsletter;