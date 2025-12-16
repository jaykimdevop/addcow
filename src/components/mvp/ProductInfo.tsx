import { LuRocket, LuSparkles, LuZap } from "react-icons/lu";

export function ProductInfo() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            우리의 제품을 소개합니다
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            혁신적인 솔루션으로 여러분의 비즈니스를 한 단계 업그레이드하세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
              <LuRocket className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              빠른 시작
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              몇 분 안에 설정하고 바로 사용할 수 있습니다. 복잡한 설정 없이
              즉시 시작하세요.
            </p>
          </div>

          <div className="p-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-6">
              <LuSparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              강력한 기능
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              필요한 모든 기능을 한 곳에서 제공합니다. 효율적이고 직관적인
              인터페이스로 생산성을 높이세요.
            </p>
          </div>

          <div className="p-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
              <LuZap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              안정적인 성능
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              빠르고 안정적인 성능을 보장합니다. 언제 어디서나 일관된 경험을
              제공합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

