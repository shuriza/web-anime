'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardNav({ prevSlug, nextSlug }) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowLeft' && prevSlug) {
        e.preventDefault();
        router.push(`/watch/${prevSlug}`);
      } else if (e.key === 'ArrowRight' && nextSlug) {
        e.preventDefault();
        router.push(`/watch/${nextSlug}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prevSlug, nextSlug, router]);

  return null;
}
