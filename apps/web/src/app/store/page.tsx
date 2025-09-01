'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  ShoppingCart,
  DollarSign,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Item = {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  subject: string;
  level: string;
  format: string;
  fileUrl?: string;
  externalUrl?: string;
  author: string;
  isFree: boolean;
  price?: number;
  downloads: number;
  views: number;
  rating: number;
  reviewCount: number;
  contributorName?: string;
};

export default function StorePage() {
  const { t } = useTranslation('common');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newItem, setNewItem] = useState<any>({
    title: '',
    description: '',
    type: 'notes',
    category: 'academic',
    subject: '',
    level: 'beginner',
    format: 'pdf',
    isFree: false,
    price: 1.99,
    author: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const res = await fetch(`/api/resources?search=${encodeURIComponent(q)}`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => []);
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
    // Fallback demo list on client if API returns empty
    setTimeout(() => {
      setItems((prev) => {
        if (prev && prev.length > 0) return prev;
        return [
          {
            id: 'demo-1',
            title: 'High-Yield Calculus Notes (Exam Ready)',
            description: 'Concise calculus notes with solved examples and exam tips.',
            type: 'notes',
            category: 'mathematics',
            subject: 'Calculus',
            level: 'intermediate',
            format: 'pdf',
            isFree: false,
            price: 2.99,
            author: 'EDU AI',
            downloads: 0,
            views: 0,
            rating: 4.8,
            reviewCount: 123,
            contributorName: 'Store Demo',
          },
          {
            id: 'demo-2',
            title: 'Physics Formula Cheatsheet',
            description: 'One-page PDF of essential formulas for quick revision.',
            type: 'notes',
            category: 'science',
            subject: 'Physics',
            level: 'beginner',
            format: 'pdf',
            isFree: true,
            price: 0,
            author: 'EDU AI',
            downloads: 0,
            views: 0,
            rating: 4.6,
            reviewCount: 89,
            contributorName: 'Store Demo',
          },
          {
            id: 'demo-3',
            title: 'Intro to Machine Learning (eBook)',
            description: 'Starter eBook for ML fundamentals with code snippets.',
            type: 'book',
            category: 'programming',
            subject: 'Machine Learning',
            level: 'intermediate',
            format: 'pdf',
            isFree: false,
            price: 4.99,
            author: 'EDU AI',
            downloads: 0,
            views: 0,
            rating: 4.7,
            reviewCount: 101,
            contributorName: 'Store Demo',
          },
        ] as any;
      });
    }, 300);
  }, []);

  const iconFor = (type: string) =>
    type === 'video' ? (
      <Video className="h-4 w-4" />
    ) : type === 'image' ? (
      <ImageIcon className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const purchase = async (id: string) => {
    const res = await fetch(`/api/resources/${id}/purchase`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      alert('Purchased successfully');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Purchase failed');
    }
  };

  const upload = async () => {
    const form = new FormData();
    Object.entries(newItem).forEach(([k, v]) => form.append(k, String(v)));
    if (file) form.append('file', file);
    const res = await fetch('/api/resources', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    if (res.ok) {
      setUploadOpen(false);
      setFile(null);
      setNewItem({
        title: '',
        description: '',
        type: 'notes',
        category: 'academic',
        subject: '',
        level: 'beginner',
        format: 'pdf',
        isFree: false,
        price: 1.99,
        author: '',
      });
      load();
    } else {
      alert('Upload failed');
    }
  };

  const paid = useMemo(() => items.filter((i) => !i.isFree), [items]);
  const free = useMemo(() => items.filter((i) => i.isFree), [items]);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Store</h1>
        <p className="text-muted-foreground">
          Earning Opportunities — Note sales, Book sharing. Sell your notes, PDFs, books, articles;
          buy curated learning materials.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Browse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search notes, books, articles..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button onClick={load}>Search</Button>
            <Button variant="secondary" onClick={() => setUploadOpen((v) => !v)}>
              <Upload className="h-4 w-4 mr-1" /> Sell your work
            </Button>
          </div>
          {uploadOpen && (
            <div className="p-3 rounded border space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Title"
                  value={newItem.title}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, title: e.target.value }))}
                />
                <Input
                  placeholder="Author"
                  value={newItem.author}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, author: e.target.value }))}
                />
                <Input
                  placeholder="Price (leave 0 for free)"
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((s: any) => ({ ...s, price: parseFloat(e.target.value) }))
                  }
                />
                <Input
                  placeholder="Category"
                  value={newItem.category}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, category: e.target.value }))}
                />
                <Input
                  placeholder="Subject"
                  value={newItem.subject}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, subject: e.target.value }))}
                />
                <Input
                  placeholder="Level"
                  value={newItem.level}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, level: e.target.value }))}
                />
                <Input
                  placeholder="Type (notes, book, article, video)"
                  value={newItem.type}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, type: e.target.value }))}
                />
                <Input
                  placeholder="Format (pdf, mp4, jpg)"
                  value={newItem.format}
                  onChange={(e) => setNewItem((s: any) => ({ ...s, format: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem((s: any) => ({ ...s, description: e.target.value }))}
              />
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="flex justify-end">
                <Button onClick={upload}>
                  <DollarSign className="h-4 w-4 mr-1" /> Publish
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(paid.length > 0 ? paid : items).map((it) => (
              <div key={it.id} className="p-4 rounded border bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="font-medium line-clamp-1">{it.title}</div>
                  <Badge variant={it.isFree ? 'secondary' : 'default'}>
                    {it.isFree ? 'Free' : `$${it.price?.toFixed(2)}`}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{it.description}</div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {iconFor(it.type)} <span className="capitalize">{it.type}</span>
                  <span>• {it.downloads} downloads</span>
                  <span>• {it.views} views</span>
                </div>
                <div className="mt-2 text-xs">By {it.contributorName || it.author}</div>
                <div className="mt-3 flex gap-2">
                  {!it.isFree ? (
                    <Button onClick={() => purchase(it.id)} className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-1" /> Buy
                    </Button>
                  ) : (
                    <a href={it.fileUrl || '#'} target="_blank" className="flex-1">
                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-1" /> Open
                      </Button>
                    </a>
                  )}
                  <Button variant="outline">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
