'use client';

import React, { useState } from 'react';
import { ImageOff, ExternalLink } from 'lucide-react';
import { PlayCircle, Image, GalleryHorizontal, LayoutGrid } from 'lucide-react'; // Assuming you have lucide-react or similar icons
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
export function SectionRenderer({ section, primaryColor = '#0ea5e9'.toString() }: { section: SectionShape, primaryColor?: string }) {

    // Helper to get a consistent primary color class/style
    const primaryStyle = { color: primaryColor };
    const primaryBgClass = `bg-[${primaryColor}]`; // Using arbitrary values for dynamic color

    // --- VIDEO SECTION ---
    if (section.type === 'video') {
        const videoUrl = section.media_url || '';
        const embed = getYouTubeEmbed(videoUrl);

        return (
            <section className="py-20 md:py-32 bg-slate-50 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Title Enhancement: Use an icon and better typography */}
                    {section.title && (
                        <div className="flex items-center justify-center text-center mb-16">
                            <PlayCircle className="w-8 h-8 mr-3 text-slate-400 shrink-0" style={primaryStyle} />
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                {section.title}
                            </h2>
                        </div>
                    )}

                    {embed ? (
                        <div className="rounded-xl overflow-hidden shadow-2xl shadow-slate-900/10 aspect-video w-full max-w-5xl mx-auto ring-4 ring-white transition-all hover:ring-8 hover:ring-opacity-50">
                            <iframe
                                src={embed}
                                title={section.title || 'Embedded Video Player'}
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        // Unavailable state enhancement: Better visual feedback
                        <div className="text-center text-slate-500 py-20 bg-white rounded-xl border-4 border-dashed border-slate-200 aspect-video flex flex-col items-center justify-center max-w-5xl mx-auto">
                            <PlayCircle className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="font-semibold text-lg">Video content currently unavailable</p>
                            <p className="text-sm text-slate-400">Please check the media URL.</p>
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
            <section className="py-20 md:py-32 bg-white overflow-hidden border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    {/* Title Enhancement: Use an icon and better contrast */}
                    {section.title && (
                        <div className="text-center">
                            <GalleryHorizontal className="w-8 h-8 mx-auto mb-3 text-slate-400" style={primaryStyle} />
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                {section.title}
                            </h2>
                            <p className="mt-3 text-lg text-slate-600">Swipe to explore the gallery.</p>
                        </div>
                    )}
                </div>

                {/* Horizontal Scroll Snap Enhancement: Better scrollbar hiding and mobile spacing */}
                <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 px-6 gap-6 scroll-smooth scrollbar-hide -mx-6 md:mx-0">
                    {/* Custom Spacer to align the first item with padding on the left */}
                    <div className="w-0 shrink-0 md:w-0" />

                    {slides.map((slide, i) => (
                        <div key={i} className="snap-start shrink-0 w-[85vw] sm:w-[400px] lg:w-[480px] h-[300px] md:h-[380px] bg-slate-100 rounded-xl shadow-xl shadow-slate-300/30 overflow-hidden relative group transition-all duration-500 hover:shadow-2xl">
                            <SafeImage
                                src={slide.image}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {slide.title && (
                                <div className="absolute bottom-0 inset-x-0 p-6 pt-16 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                                    <p className="font-semibold text-white text-2xl drop-shadow-lg">{slide.title}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Custom Spacer for mobile to align the last item */}
                    <div className="w-6 shrink-0 md:w-0" />
                </div>
            </section>
        );
    }

    // --- CARDS SECTION ---
    if (section.type === 'cards') {
        let cards: CardItem[] = [];
        try { cards = section.layout ? JSON.parse(section.layout) : []; } catch { cards = []; }

        return (
            <section className="py-20 md:py-32 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Title Enhancement: Icon and stronger font */}
                    {section.title && (
                        <div className="text-center mb-16 md:mb-20">
                            <LayoutGrid className="w-8 h-8 mx-auto mb-3 text-slate-400" style={primaryStyle} />
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                {section.title}
                            </h2>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {cards.map((card, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-8 shadow-md transition-all duration-300 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col items-start group hover:-translate-y-1">
                                {card.image ? (
                                    <div className="w-12 h-12 mb-6 rounded-lg overflow-hidden shadow-inner bg-slate-50 ring-2 ring-slate-100/80 group-hover:ring-offset-2 transition-all duration-300">
                                        <SafeImage src={card.image} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-lg bg-slate-100 transition-colors duration-300">
                                        <Image className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}

                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{card.title}</h3>
                                {/* Subtitle Enhancement: Use primary color with higher saturation and strong tracking */}
                                {card.subtitle && <p className="font-bold text-xs mb-4 uppercase tracking-widest" style={primaryStyle}>{card.subtitle}</p>}
                                <p className="text-slate-600 leading-normal text-sm flex-1">{card.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // --- DEFAULT TEXT / MEDIA SECTION (Enhanced for Center & Glass Effect) ---
    // This is typically the 'about us' or 'text and image' section.
    if (section.type === 'default' || !section.type) {
        // Note: The outer section retains large padding, but the content is now centered
        // within a max-width container that uses the background effect.
        return (
            <section className="py-24 md:py-40 bg-slate-50 border-b border-slate-100 mt-20">
                <div className="max-w-7xl mx-auto px-6 mt-20">

                    {/* Visual Wrapper for the 'Glass' Effect */}
                    <div className="max-w-6xl mx-auto p-8 md:p-16 bg-white/70 backdrop-blur-md rounded-3xl shadow-3xl ring-1 ring-slate-200/50">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                            {/* TEXT CONTENT COLUMN */}
                            <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
                                {/* Subtitle / Eyebrow Text */}
                                {section.title && (
                                    <p className="font-semibold text-sm uppercase tracking-widest text-slate-500" style={primaryStyle}>
                                        {section.title}
                                    </p>
                                )}

                                {section.title && (
                                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                        {section.title}
                                    </h2>
                                )}

                                {/* Content Enhancement: Tighter vertical rhythm and strong contrast */}
                                <div
                                    className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-5 lg:space-y-6"
                                    dangerouslySetInnerHTML={{ __html: section.content || '' }}
                                />
                            </div>

                            {/* MEDIA COLUMN */}
                            {section.media_url ? (
                                <div className="order-1 lg:order-2">
                                    {/* Image Enhancement: Cleaner, slightly angled, modern shadow */}
                                    <div className="rounded-xl overflow-hidden shadow-2xl shadow-slate-900/10 rotate-1 hover:rotate-0 transition-transform duration-700 bg-slate-100 ring-2 ring-white aspect-[4/3] relative">
                                        <SafeImage
                                            src={section.media_url}
                                            alt={section.title || 'Section Image'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                </div>
            </section>
        );
    }

    return null;
}
