type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({
  children,
  onClose,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl"
          aria-label="Close modal"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}