"use client";
import { useEffect } from 'react';
import { useRouter, useParams as useNextParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigate({ to, replace }) {
    const router = useRouter();
    useEffect(() => {
        if (replace) router.replace(to);
        else router.push(to);
    }, [to, replace, router]);
    return null;
}

export function useNavigate() {
    const router = useRouter();
    return (to, options) => {
        if (options?.replace) router.replace(to);
        else router.push(to);
    };
}

export function useParams() {
    return useNextParams();
}

export function NavLink({ href, children, className, onClick }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    // Evaluate className if it's a function (like react-router-dom)
    const computedClassName = typeof className === 'function' ? className({ isActive }) : className;
    
    return (
        <Link href={href} className={computedClassName} onClick={onClick}>
            {children}
        </Link>
    );
}
