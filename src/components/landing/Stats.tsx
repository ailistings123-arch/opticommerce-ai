const stats = [
  { value: "12,000+", label: "Active Sellers" },
  { value: "147,000+", label: "Products Optimized" },
  { value: "$48M+", label: "Revenue Generated" },
  { value: "4.9/5", label: "User Rating" }
];

export default function Stats() {
  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-blue-100 text-xs sm:text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
