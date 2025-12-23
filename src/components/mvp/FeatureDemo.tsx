import { LuCheck } from "react-icons/lu";

export function FeatureDemo() {
  const features = [
    "실시간 협업 도구",
    "고급 분석 대시보드",
    "자동화 워크플로우",
    "보안 및 권한 관리",
    "모바일 앱 지원",
    "24/7 고객 지원",
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              주요 기능
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              비즈니스에 필요한 모든 기능을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <LuCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {feature}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        강력하고 직관적인 기능으로 업무 효율을 극대화합니다.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">데모 영상</h3>
                  <p className="text-blue-100">실제 사용 예시를 확인해보세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
