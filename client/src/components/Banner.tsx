import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import banner1 from '../assets/img/banner1.webp';
import banner2 from '../assets/img/banner2.webp';
import banner3 from '../assets/img/banner3.webp';

interface BannerProps {
    autoPlay?: boolean;
    interval?: number;
}

export default function Banner({ autoPlay = true, interval = 5000 }: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const banners = [banner1, banner2, banner3];

    // Auto play carousel
    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, banners.length]);

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative w-full h-96 bg-gray-200 overflow-hidden rounded-lg shadow-lg">
            {/* Banners Container */}
            <div className="relative w-full h-full">
                {banners.map((banner, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={banner}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Previous Button */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition z-10"
                aria-label="Previous banner"
            >
                <FaChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition z-10"
                aria-label="Next banner"
            >
                <FaChevronRight size={24} />
            </button>

            {/* Indicators (Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition ${index === currentSlide
                                ? 'bg-white scale-125'
                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                        aria-label={`Go to banner ${index + 1}`}
                    />
                ))}
            </div>

            {/* Counter/Info */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm">
                {currentSlide + 1} / {banners.length}
            </div>
        </div>
    );
}