export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded bg-black px-3 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
    >
      Skip to content
    </a>
  );
}
