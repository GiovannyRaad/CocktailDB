function Menu() {
  return (
    <main
      data-theme="caramellatte"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(201,157,102,0.12),_transparent_30%),linear-gradient(180deg,#fbf6ef_0%,#f7efe4_100%)] text-base-content"
    >
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12 sm:px-8">
        <section className="w-full rounded-box border border-base-300/70 bg-base-100/80 p-8 shadow-xl shadow-black/10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-base-content/55">
            Menu
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
            Cocktail menu
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-base-content/70">
            This page is ready for the actual menu content.
          </p>
          <div className="mt-8">
            <a href="/" className="btn btn-outline rounded-full px-8">
              Back home
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Menu;
