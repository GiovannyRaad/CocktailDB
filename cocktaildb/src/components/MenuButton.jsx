function MenuButton() {
  return (
    <a
      href="/menu"
      className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-[linear-gradient(180deg,rgba(255, 153, 0, 1),rgba(255, 136, 0, 1))] px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-100/60 hover:bg-[linear-gradient(180deg,rgba(245,219,180,0.42),rgba(168,116,57,0.4))] hover:text-amber-50 hover:shadow-[0_14px_34px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      Open Menu
    </a>
  );
}

export default MenuButton;
