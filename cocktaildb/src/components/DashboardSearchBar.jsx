function DashboardSearchBar({ value, onChange, placeholder }) {
  return (
    <section className="mb-4 rounded-box border border-amber-200/15 bg-[#1a130f]/80 p-3 shadow-lg sm:mb-6 sm:p-4">
      <label className="form-control w-full">
        <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-amber-200/70">
          Search
        </span>
        <input
          type="text"
          className="input input-bordered w-full"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </label>
    </section>
  );
}

export default DashboardSearchBar;
