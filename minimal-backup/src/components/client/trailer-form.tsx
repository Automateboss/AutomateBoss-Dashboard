'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTrailerRequest } from '@/app/actions/client-portal'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TrailerForm() {
    const router = useRouter()
    const supabase = createClient()
    const [tab, setTab] = useState('basic')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        make: '',
        trailer_type: '',
        model: '',
        last_6_vin: '',
        mba_insured: true,
        hook_up_type: 'ball_hitch',
        gvwr: '',
        load_capacity: '',
        interior_length: '',
        interior_width: '',
        rate_24hr: '',
        rate_weekly: '',
        deposit: '',
        photo_urls: [] as string[]
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        setError(null)

        try {
            const newPhotoUrls = [...formData.photo_urls]

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${Date.now()}-${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('trailers')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('trailers')
                    .getPublicUrl(filePath)

                newPhotoUrls.push(publicUrl)
            }

            setFormData(prev => ({ ...prev, photo_urls: newPhotoUrls }))
        } catch (err: any) {
            setError('Failed to upload images: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photo_urls: prev.photo_urls.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            await createTrailerRequest(formData)
            setSuccess(true)
            setTimeout(() => router.push('/dashboard/trailers'), 2000)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="max-w-xl mx-auto border-primary/20 bg-card/50 backdrop-blur-sm p-12 flex flex-col items-center text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
                <CardTitle className="text-2xl font-black">Request Submitted!</CardTitle>
                <CardDescription>
                    Your trailer addition request has been sent to our team. We&#39;ll update your dashboard once implementation into GHL begins.
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="max-w-3xl mx-auto border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-2xl font-black tracking-tight text-primary">ADD NEW TRAILER</CardTitle>
                <CardDescription className="font-medium">
                    Provide specifications and photos for GHL implementation.
                </CardDescription>
            </CardHeader>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <div className="px-6 pt-6 flex justify-center">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                        <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                            1. Basic
                        </TabsTrigger>
                        <TabsTrigger value="specs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                            2. Specs
                        </TabsTrigger>
                        <TabsTrigger value="rates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                            3. Rates
                        </TabsTrigger>
                        <TabsTrigger value="photos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                            4. Photos
                        </TabsTrigger>
                    </TabsList>
                </div>

                <CardContent className="pt-6 space-y-6">
                    <TabsContent value="basic" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="make">Make</Label>
                                <Input name="make" placeholder="e.g. Big Tex" value={formData.make} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input name="model" placeholder="e.g. 14LP" value={formData.model} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="trailer_type">Type</Label>
                                <Input name="trailer_type" placeholder="e.g. Dump Trailer" value={formData.trailer_type} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_6_vin">Last 6 of VIN</Label>
                                <Input name="last_6_vin" placeholder="123456" maxLength={6} value={formData.last_6_vin} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setTab('specs')} size="sm" className="font-bold tracking-tight">
                                NEXT: SPECS <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="specs" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gvwr">GVWR (lbs)</Label>
                                <Input name="gvwr" placeholder="14000" value={formData.gvwr} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="load_capacity">Load Capacity (lbs)</Label>
                                <Input name="load_capacity" placeholder="10000" value={formData.load_capacity} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="interior_length">Interior Length</Label>
                                <Input name="interior_length" placeholder="12ft" value={formData.interior_length} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interior_width">Interior Width</Label>
                                <Input name="interior_width" placeholder="82in" value={formData.interior_width} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setTab('basic')} size="sm" className="font-bold">
                                <ChevronLeft className="mr-2 h-4 w-4" /> PREVIOUS
                            </Button>
                            <Button onClick={() => setTab('rates')} size="sm" className="font-bold tracking-tight">
                                NEXT: RATES <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="rates" className="space-y-4 mt-0">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rate_24hr">24hr Rate ($)</Label>
                                <Input name="rate_24hr" type="number" placeholder="150" value={formData.rate_24hr} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate_weekly">Weekly Rate ($)</Label>
                                <Input name="rate_weekly" type="number" placeholder="700" value={formData.rate_weekly} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Security Deposit ($)</Label>
                                <Input name="deposit" type="number" placeholder="300" value={formData.deposit} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setTab('specs')} size="sm" className="font-bold">
                                <ChevronLeft className="mr-2 h-4 w-4" /> PREVIOUS
                            </Button>
                            <Button onClick={() => setTab('photos')} size="sm" className="font-bold tracking-tight">
                                NEXT: PHOTOS <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="photos" className="space-y-6 mt-0">
                        <div className="space-y-4">
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-8 text-center transition-colors flex flex-col items-center justify-center space-y-2",
                                    uploading ? "bg-muted animate-pulse border-muted-foreground/20" : "bg-card/30 border-primary/10 hover:border-primary/30"
                                )}
                            >
                                <div className="p-4 rounded-full bg-primary/10 text-primary">
                                    <Upload className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-primary">Upload Trailer Photos</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">PNG, JPG or JPEG up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </div>

                            {formData.photo_urls.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {formData.photo_urls.map((url, index) => (
                                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-primary/10 bg-muted">
                                            <img src={url} alt={`Upload ${index}`} className="object-cover w-full h-full" />
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.photo_urls.length === 0 && !uploading && (
                                <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                    <ImageIcon className="h-12 w-12 mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest">No photos uploaded</p>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-xs font-bold text-destructive uppercase tracking-tight">{error}</p>}

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setTab('rates')} size="sm" className="font-bold">
                                <ChevronLeft className="mr-2 h-4 w-4" /> PREVIOUS
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading || uploading} size="sm" className="font-bold tracking-tight px-8">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                COMPLETE REQUEST
                            </Button>
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    )
}
