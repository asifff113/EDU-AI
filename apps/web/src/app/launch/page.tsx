'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/lib/env';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ContentDraft = {
  type: 'video' | 'pdf' | 'image' | 'text' | 'file';
  title?: string;
  description?: string;
  textContent?: string;
  file?: File | null;
};

export default function LaunchCoursePage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [contents, setContents] = useState<ContentDraft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const addContent = (type: ContentDraft['type']) => {
    setContents((list) => [
      ...list,
      { type, title: '', description: '', textContent: '', file: null },
    ]);
  };

  const updateContent = (index: number, patch: Partial<ContentDraft>) => {
    setContents((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeContent = (index: number) => {
    setContents((list) => list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      const form = new FormData();
      form.set('title', title);
      if (description) form.set('description', description);
      if (details) form.set('details', details);
      if (price) form.set('price', price);
      if (seats) form.set('seats', seats);
      if (category) form.set('category', category);
      if (level) form.set('level', level);
      if (thumbnail) form.set('thumbnail', thumbnail);

      // Prepare JSON content entries for text-only items
      const jsonContents = contents
        .map((c, idx) => {
          if (c.type === 'text') {
            return {
              type: 'text',
              title: c.title,
              description: c.description,
              textContent: c.textContent,
              order: idx,
            };
          }
          return null;
        })
        .filter(Boolean);
      if (jsonContents.length) form.set('contents', JSON.stringify(jsonContents));

      // Attach files; backend will infer types
      contents.forEach((c) => {
        if (c.file) form.append('contentFiles', c.file);
      });

      const base = getApiBaseUrl();
      const res = await fetch(`${base}/courses`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || 'Failed to create course');
        setUploading(false);
        return;
      }

      router.push('/courses');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.launchTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.launchDesc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (leave blank for free)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="seats">Seats (optional)</Label>
                <Input
                  id="seats"
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Beginner / Intermediate / Advanced"
                />
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="details">Full Details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Contents</h3>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => addContent('video')}>
                    Add Video
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => addContent('pdf')}>
                    Add PDF
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => addContent('image')}>
                    Add Image
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => addContent('text')}>
                    Add Text
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {contents.map((c, idx) => (
                  <div key={idx} className="border rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{c.type.toUpperCase()}</span>
                      <Button type="button" variant="ghost" onClick={() => removeContent(idx)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={c.title || ''}
                          onChange={(e) => updateContent(idx, { title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={c.description || ''}
                          onChange={(e) => updateContent(idx, { description: e.target.value })}
                        />
                      </div>
                      {c.type === 'text' ? (
                        <div className="md:col-span-2">
                          <Label>Text</Label>
                          <Textarea
                            value={c.textContent || ''}
                            onChange={(e) => updateContent(idx, { textContent: e.target.value })}
                            rows={4}
                          />
                        </div>
                      ) : (
                        <div className="md:col-span-2">
                          <Label>File</Label>
                          <Input
                            type="file"
                            onChange={(e) =>
                              updateContent(idx, { file: e.target.files?.[0] || null })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Launching...' : 'Launch Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
