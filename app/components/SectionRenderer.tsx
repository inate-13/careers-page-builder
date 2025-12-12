'use client';

import React, { useState } from 'react';
import { ImageOff, ExternalLink } from 'lucide-react';

export type CardItem = {
    id: string;
    title: string;
    subtitle?: string;
    body?: string;
    image?: string;
};

export type SectionShape = {
    id: string;
    type: string;
    title?: string | null;
    content?: string | null;
    media_url?: string | null;
    layout?: string | null;
};

// Helper for YouTube
function getYouTubeEmbed(url: string | null | undefined) {
    if (!url) return null;
    try {
        const u = new URL(url);
        // Handle common YouTube formats
        if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
        if (u.hostname.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
            if (u.pathname.startsWith('/embed/')) return url;
        }
    } catch { return null; }
    return null;
}

// Helper to try and fix common bad image links (like Unsplash page links)
function fixImageUrl(url: string): string {
    if (!url) return '';
    try {
        // Unsplash Photo Page -> Source URL (Naive attempt)
        // e.g. https://unsplash.com/photos/ID -> https://images.unsplash.com/photo-ID?w=800
        if (url.includes('unsplash.com/photos/')) {
            const id = url.split('/').pop();
            if (id) return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
        }
    } catch { }
    return url;
}

// Robust Image Component
function SafeImage({ src, alt, className }: { src?: string, alt?: string, className?: string }) {
    const [error, setError] = useState(false);

    // Attempt optimization
    const safeSrc = fixImageUrl(src || '');

    if (!safeSrc || error) {
        return (
            <div className={`bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center border border-slate-200 ${className}`}>
                <ImageOff size={24} className="mb-2 opacity-50" />
                <span>Image not loaded</span>
            </div>
        );
    }
    return (
        <img
            src={safeSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}

export function SectionRenderer({ section, primaryColor = '#0ea5e9' }: { section: SectionShape, primaryColor?: string }) {

    // --- VIDEO SECTION ---
    if (section.type === 'video') {
        const videoUrl = section.media_url || '';
        const embed = getYouTubeEmbed(videoUrl);

        return (
            <section className="py-16 md:py-24 bg-white border-b border-slate-50">
                <div className="max-w-5xl mx-auto px-6">
                    {section.title && (
                        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-slate-900 tracking-tight">
                            {section.title}
                        </h2>
                    )}
                    {embed ? (
                        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video w-full max-w-4xl mx-auto ring-1 ring-slate-900/5">
                            <iframe
                                src={embed}
                                title={section.title || 'Video'}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="font-medium">Video content unavailable</p>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    // --- CAROUSEL (GALLERY) SECTION ---
    if (section.type === 'carousel') {
        let slides: any[] = [];
        try { slides = section.layout ? JSON.parse(section.layout) : []; } catch { slides = []; }

        if (slides.length === 0) return null;

        return (
            <section className="py-20 bg-slate-50 overflow-hidden border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    {section.title && (
                        <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900">
                            {section.title}
                        </h2>
                    )}
                </div>

                {/* Horizontal Scroll Snap */}
                <div className="flex overflow-x-auto snap-x snap-mandatory pb-10 px-6 gap-6 scrollbar-hide -mx-6 md:mx-0">
                    {/* Spacer for mobile */}
                    <div className="w-1 shrink-0 md:hidden" />

                    {slides.map((slide, i) => (
                        <div key={i} className="snap-center shrink-0 w-[85vw] md:w-[500px] h-[300px] md:h-[350px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
                            <SafeImage src={slide.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            {slide.title && (
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    <p className="font-bold text-white text-lg">{slide.title}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Spacer for mobile */}
                    <div className="w-1 shrink-0 md:hidden" />
                </div>
            </section>
        );
    }

    // --- CARDS SECTION ---
    if (section.type === 'cards') {
        let cards: CardItem[] = [];
        try { cards = section.layout ? JSON.parse(section.layout) : []; } catch { cards = []; }

        return (
            <section className="py-20 md:py-32 bg-white border-b border-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    {section.title && (
                        <h2 className="text-3xl md:text-5xl font-black text-center mb-20 text-slate-900 tracking-tight">
                            {section.title}
                        </h2>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cards.map((card, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 border border-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col items-start group">
                                {card.image && (
                                    <div className="w-16 h-16 mb-6 rounded-2xl overflow-hidden shadow-sm bg-white ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300">
                                        <SafeImage src={card.image} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h3>
                                {card.subtitle && <p className="font-bold text-sm mb-4 uppercase tracking-wider opacity-80" style={{ color: primaryColor }}>{card.subtitle}</p>}
                                <p className="text-slate-600 leading-relaxed text-sm flex-1">{card.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // --- DEFAULT TEXT SECTION ---
    return (
        <section className="py-20 md:py-32 bg-white overflow-hidden border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 space-y-8">
                        {section.title && (
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                {section.title}
                            </h2>
                        )}
                        <div
                            className="prose prose-lg text-slate-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: section.content || '' }}
                        />
                    </div>
                    {section.media_url ? (
                        <div className="order-1 lg:order-2">
                            <div className="rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 bg-slate-100 ring-1 ring-slate-900/5 aspect-[4/3] relative">
                                <SafeImage
                                    src={section.media_url}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
