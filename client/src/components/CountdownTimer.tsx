import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component hiển thị từng khối số (Giờ, Phút, Giây)
const TimeBlock = ({ value }: { value: string }) => {
    return (
        <div className="flex flex-col items-center mx-1">
            {/* Container cố định kích thước, overflow hidden để giấu số trượt ra ngoài */}
            <div className="relative w-14 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={value} // Quan trọng: Key thay đổi thì animation mới chạy
                        initial={{ y: '-100%', opacity: 0, filter: 'blur(5px)' }} // Bắt đầu: ở trên và mờ
                        animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}    // Kết thúc: ở giữa và rõ
                        exit={{ y: '100%', opacity: 0, filter: 'blur(5px)' }}     // Thoát: xuống dưới và mờ
                        transition={{
                            duration: 0.4, // Thời gian chạy animation (0.4s)
                            ease: "backOut" // Hiệu ứng nảy nhẹ khi số vào vị trí
                        }}
                        className="absolute text-2xl font-bold font-mono text-rose-600 block"
                    >
                        {value}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
};

const Separator = () => (
    <div className="h-12 flex items-center pb-2">
        <span className="text-xl font-bold text-rose-300 mx-1 animate-pulse">:</span>
    </div>
);

export const CountdownTimer = memo(({ timeRemaining }: { timeRemaining: number }) => {
    // State nội bộ để tự đếm ngược ở client
    const [timeLeft, setTimeLeft] = useState(timeRemaining);

    // 1. Effect tự đếm ngược mỗi giây (Client-side Ticking)
    useEffect(() => {
        // Nếu hết giờ thì dừng
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // 2. Effect đồng bộ với Socket (Drift Correction)
    // Chỉ cập nhật lại nếu thời gian client lệch quá nhiều so với server (> 2 giây)
    // Điều này giúp tránh việc UI bị giật cục mỗi khi socket gửi data về
    useEffect(() => {
        const drift = Math.abs(timeRemaining - timeLeft);
        if (drift > 2000) {
            setTimeLeft(timeRemaining);
        }
    }, [timeRemaining]);

    // Hàm format
    const format = (ms: number) => {
        if (ms <= 0) return { h: "00", m: "00", s: "00" };
        const totalSeconds = Math.floor(ms / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600); // Cho phép hiển thị > 24h

        return {
            h: hours.toString().padStart(2, '0'),
            m: minutes.toString().padStart(2, '0'),
            s: seconds.toString().padStart(2, '0')
        };
    };

    const time = format(timeLeft);

    return (
        <div className="flex items-start justify-center">
            <TimeBlock value={time.h} />
            <Separator />
            <TimeBlock value={time.m} />
            <Separator />
            <TimeBlock value={time.s} />
        </div>
    );
});

CountdownTimer.displayName = "CountdownTimer";