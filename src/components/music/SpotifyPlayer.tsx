export const SpotifyPlayer = () => {
    return (
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gym-primary/10 border border-white/10 bg-[#121212] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-gym-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <iframe
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator&theme=0"
                width="100%"
                height="380"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="relative z-10"
            />
        </div>
    );
};
