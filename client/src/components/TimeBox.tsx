"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeBox({ startTime }: { startTime: string }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const target = parseAuctionDate(startTime);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = target.getTime() - now;

            if (distance <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((distance / (1000 * 60)) % 60),
                seconds: Math.floor((distance / 1000) % 60),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    return (
        <div className="flex justify-center gap-4 mb-4 text-center">
            <TimeBoxItem label="Ngày" value={timeLeft.days} />
            <TimeBoxItem label="Giờ" value={timeLeft.hours} />
            <TimeBoxItem label="Phút" value={timeLeft.minutes} />
            <TimeBoxItem label="Giây" value={timeLeft.seconds} />
        </div>
    );
}

function TimeBoxItem({ label, value }: { label: string; value: number }) {
    const formattedValue = String(value).padStart(2, "0");

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-2 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={value}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <p className="text-3xl font-bold text-blue-700">
                            {formattedValue}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
            <p className="text-lg text-gray-600">{label}</p>
        </div>
    );
}

function parseAuctionDate(timeStr: string): Date {
    try {
        const targetDate = new Date(timeStr);
        if (isNaN(targetDate.getTime())) {
            throw new Error("Invalid date format");
        }
        return targetDate;
    } catch {
        console.error("Failed to parse auction date string:", timeStr);
        return new Date();
    }
}
