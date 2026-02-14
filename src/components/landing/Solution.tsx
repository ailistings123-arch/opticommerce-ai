import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const steps = [
  {
    number: 1,
    icon: CloudUploadIcon,
    title: "Tell Us About Your Product",
    description: "Upload images, paste your current listing, or just describe what you sell. Our AI understands what you're selling in seconds.",
    color: "bg-blue-600"
  },
  {
    number: 2,
    icon: AutoAwesomeIcon,
    title: "AI Does the Heavy Lifting",
    description: "Our advanced AI analyzes 50,000+ successful listings, researches trending keywords, studies your competitors, and generates professional, conversion-optimized content.",
    color: "bg-purple-600"
  },
  {
    number: 3,
    icon: ContentCopyIcon,
    title: "Copy, Publish, Profit",
    description: "Get your optimized title, bullets, description, and backend keywords ready to copy-paste. Watch your rankings climb and sales soar.",
    color: "bg-green-600"
  }
];

export default function Solution() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            AI Optimization That Actually Works
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            ListingOptimizer AI analyzes your product, researches your market, and creates professional, 
            SEO-optimized listings that rank higher and convert better—in under 2 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 ${step.color} text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg`}>
                    {step.number}
                  </div>
                  <div className={`w-12 h-12 ${step.color.replace('600', '100')} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={step.color.replace('bg-', 'text-')} sx={{ fontSize: 24 }} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -ml-6" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
