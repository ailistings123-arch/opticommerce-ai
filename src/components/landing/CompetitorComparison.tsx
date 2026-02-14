import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';

const comparisonData = [
  { feature: "Pricing", opti: "$19-149/mo", helium: "$97-279/mo", jungle: "$49-189/mo", manual: "Free (your time)" },
  { feature: "AI-Powered", opti: "advanced", helium: "basic", jungle: "basic", manual: "none" },
  { feature: "Platforms", opti: "6 platforms", helium: "Amazon only", jungle: "Amazon only", manual: "All (manual)" },
  { feature: "Speed", opti: "2 minutes", helium: "15-30 minutes", jungle: "15-30 minutes", manual: "4-8 hours" },
  { feature: "Keyword Research", opti: "yes", helium: "yes", jungle: "yes", manual: "manual" },
  { feature: "SEO Scoring", opti: "detailed", helium: "basic", jungle: "basic", manual: "none" },
  { feature: "Competitor Analysis", opti: "yes", helium: "yes", jungle: "yes", manual: "manual" },
  { feature: "Bulk Optimization", opti: "yes", helium: "no", jungle: "no", manual: "no" },
  { feature: "A+ Content", opti: "templates", helium: "yes", jungle: "no", manual: "manual" },
  { feature: "Multi-language", opti: "coming", helium: "yes", jungle: "limited", manual: "yes" }
];

const renderCell = (value: string) => {
  if (value === "yes" || value === "advanced" || value === "detailed" || value === "templates") {
    return <CheckCircleIcon className="text-green-600 mx-auto" sx={{ fontSize: 24 }} />;
  }
  if (value === "no" || value === "none") {
    return <CancelIcon className="text-red-400 mx-auto" sx={{ fontSize: 24 }} />;
  }
  if (value === "basic" || value === "manual" || value === "limited" || value === "coming") {
    return <WarningIcon className="text-yellow-500 mx-auto" sx={{ fontSize: 24 }} />;
  }
  return <span className="text-sm text-gray-700">{value}</span>;
};

export default function CompetitorComparison() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ListingOptimizer AI vs. The Competition
          </h2>
          <p className="text-xl text-gray-600">See how we stack up against the alternatives</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold bg-blue-500">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">ListingOptimizer AI</span>
                      <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">BEST VALUE</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Helium 10</th>
                  <th className="px-6 py-4 text-center font-semibold">Jungle Scout</th>
                  <th className="px-6 py-4 text-center font-semibold">Manual</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold">{renderCell(row.opti)}</td>
                    <td className="px-6 py-4 text-center">{renderCell(row.helium)}</td>
                    <td className="px-6 py-4 text-center">{renderCell(row.jungle)}</td>
                    <td className="px-6 py-4 text-center">{renderCell(row.manual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="text-green-600" sx={{ fontSize: 18 }} />
            <span>Full support</span>
          </div>
          <div className="flex items-center gap-2">
            <WarningIcon className="text-yellow-500" sx={{ fontSize: 18 }} />
            <span>Limited/Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <CancelIcon className="text-red-400" sx={{ fontSize: 18 }} />
            <span>Not available</span>
          </div>
        </div>
      </div>
    </section>
  );
}
