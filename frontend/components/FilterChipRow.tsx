type FilterChipRowProps = {
    options: string[];
    selectedOption: string;
    onSelect: (option: string) => void;
    ariaLabel: string;
};

export default function FilterChipRow({
    options,
    selectedOption,
    onSelect,
    ariaLabel,
}: FilterChipRowProps) {
    return (
        <div
            className="
                -mx-6 mt-5 overflow-x-auto px-6 pb-2
                touch-pan-x overscroll-x-contain
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                sm:mx-0 sm:px-0
            "
        >
            <div
                role="group"
                aria-label={ariaLabel}
                className="flex w-max items-center gap-2"
            >
                {options.map((option) => {
                    const isSelected = selectedOption === option;

                    return (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onSelect(option)}
                            className={`
                                min-h-9 shrink-0 whitespace-nowrap rounded-full
                                px-4 py-2 text-sm font-medium transition-colors
                                ${
                                    isSelected
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                }
                            `}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}