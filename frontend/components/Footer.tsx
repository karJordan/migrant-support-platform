export default function Footer() {
    return (
        <footer className="w-full flex items-center justify-between px-8 py-4 border-t border-neutral/20 bg-white">
            <p className="text-sm text-neutral">
                &copy; {new Date().getFullYear()} MigrantHub. All rights reserved.
            </p>
        </footer>
    );
}