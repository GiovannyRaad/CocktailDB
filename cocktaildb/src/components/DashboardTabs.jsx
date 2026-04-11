function DashboardTabs({ activeTab, onChangeTab }) {
  return (
    <section className="mb-6 rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:p-4">
      <div
        role="tablist"
        className="flex w-full rounded-xl border border-amber-300/30 bg-[#2a1f18]/80 p-1"
      >
        <button
          type="button"
          role="tab"
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition ${
            activeTab === "cocktails"
              ? "bg-amber-300 text-[#2a1b11] shadow"
              : "text-amber-100/70 hover:bg-[#3a2a22] hover:text-amber-50"
          }`}
          onClick={() => onChangeTab("cocktails")}
        >
          Cocktails
        </button>
        <button
          type="button"
          role="tab"
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition ${
            activeTab === "ingredients"
              ? "bg-amber-300 text-[#2a1b11] shadow"
              : "text-amber-100/70 hover:bg-[#3a2a22] hover:text-amber-50"
          }`}
          onClick={() => onChangeTab("ingredients")}
        >
          Ingredients
        </button>
      </div>
    </section>
  );
}

export default DashboardTabs;
