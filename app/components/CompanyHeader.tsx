'use client';

import React from 'react';
import { Search } from 'lucide-react';

type CompanyHeaderProps = {
    company: {
        name: string;
        tagline?: string | null;
        banner_url?: string | null;
        logo_url?: string | null;
        primary_color?: string | null;
        accent_color?: string | null;
    };
};

export function CompanyHeader({ company }: CompanyHeaderProps) {
    const primaryColor = company.primary_color ?? '#0f172a';
    const accentColor = company.accent_color ?? '#3b82f6';
    const hasBanner = !!company.banner_url && company.banner_url.trim().length > 5;

    return (
        <header style={{ 
            position: 'relative', 
            width: '100%', 
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#1e293b'
        }}>
            {/* Background Image or Color */}
            {hasBanner ? (
                <img
                    src={company.banner_url!}
                    alt="Banner"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        zIndex: 1
                    }}
                />
            ) : (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: primaryColor,
                    zIndex: 1
                }} />
            )}

            {/* Dark Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
                zIndex: 2
            }} />

            {/* Logo - Top Right */}
            {company.logo_url && company.logo_url.trim().length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 10
                }}>
                    <img
                        src={company.logo_url}
                        alt="Logo"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}

            {/* Centered Text Content */}
            <div style={{
                position: 'relative',
                zIndex: 5,
                textAlign: 'center',
                padding: '0 24px',
                maxWidth: '1000px',
                width: '100%'
            }}>
                {/* Company Name */}
                <h1 style={{
                    fontSize: 'clamp(2rem, 8vw, 5rem)',
                    fontWeight: 900,
                    color: 'white',
                    marginBottom: '24px',
                    textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.9)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                }}>
                    {company.name}
                </h1>

                {/* Tagline */}
                {company.tagline && company.tagline.trim().length > 0 && (
                    <div style={{
                        display: 'inline-block',
                        padding: '12px 32px',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: '50px',
                        marginBottom: '32px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        <p style={{
                            fontSize: 'clamp(1rem, 3vw, 1.875rem)',
                            fontWeight: 700,
                            color: accentColor,
                            margin: 0
                        }}>
                            {company.tagline}
                        </p>
                    </div>
                )}

                {/* CTA Button */}
                <div>
                    <a
                        href="#open-positions"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 32px',
                            backgroundColor: accentColor,
                            color: 'white',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            textDecoration: 'none',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span>Explore Opportunities</span>
                        <Search size={20} />
                    </a>
                </div>
            </div>
        </header>
    );
}