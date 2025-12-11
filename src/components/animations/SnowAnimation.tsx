import React, { useEffect, useState } from 'react';

export const SnowAnimation: React.FC = () => {
    const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; duration: number; delay: number; size: number; opacity: number }>>([]);

    useEffect(() => {
        const count = 50;
        const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: Math.random() * 5 + 5, // 5-10s (slower)
            delay: Math.random() * 5,
            size: Math.random() * 4 + 2, // 2-6px
            opacity: Math.random() * 0.4 + 0.1, // 0.1-0.5 (more subtle)
        }));
        setSnowflakes(newSnowflakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-10px] bg-white rounded-full backdrop-blur-sm"
                    style={{
                        left: `${flake.left}%`,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        opacity: flake.opacity,
                        animation: `fall ${flake.duration}s linear infinite`,
                        animationDelay: `${flake.delay}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10px) translateX(0px);
                    }
                    25% {
                        transform: translateY(25vh) translateX(15px);
                    }
                    50% {
                        transform: translateY(50vh) translateX(-15px);
                    }
                    75% {
                        transform: translateY(75vh) translateX(15px);
                    }
                    100% {
                        transform: translateY(105vh) translateX(0px);
                    }
                }
            `}</style>
        </div>
    );
};
