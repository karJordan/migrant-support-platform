type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};

export default function Modal({
    children,
    onClose,
}: ModalProps) {
    return (
        <div
            className="
                fixed inset-x-0 top-0
                bottom-[calc(5rem+env(safe-area-inset-bottom))]
                z-[60] flex items-center justify-center
                bg-black/40 p-4
                md:inset-0
            "
        >
            <div
                className="
                    relative max-h-full w-full max-w-lg
                    overflow-y-auto overscroll-contain
                    rounded-xl bg-white p-6 shadow-lg
                "
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 text-xl"
                    aria-label="Close modal"
                >
                    ×
                </button>

                {children}
            </div>
        </div>
    );
}