const stats = [
  { value: "12,000+", label: "Active Sellers" },
  { value: "147,000+", label: "Products Optimized" },
  { value: "$48M+", label: "Revenue Generated" },
  { value: "4.9/5", label: "User Rating" }
];

export default function Stats() {
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-blue-100 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
