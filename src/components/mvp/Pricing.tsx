import { LuCheck } from "react-icons/lu";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "무료",
      description: "개인 프로젝트에 적합",
      features: [
        "기본 기능 사용",
        "최대 5개 프로젝트",
        "커뮤니티 지원",
        "기본 템플릿",
      ],
      cta: "시작하기",
      popular: false,
    },
    {
      name: "Pro",
      price: "₩29,000",
      period: "/월",
      description: "팀과 비즈니스에 적합",
      features: [
        "모든 기능 사용",
        "무제한 프로젝트",
        "우선 지원",
        "고급 템플릿",
        "팀 협업 도구",
        "API 접근",
      ],
      cta: "지금 시작",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "맞춤형",
      description: "대규모 조직에 적합",
      features: [
        "모든 Pro 기능",
        "전용 지원",
        "맞춤형 통합",
        "고급 보안",
        "SLA 보장",
        "온보딩 지원",
      ],
      cta: "문의하기",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              가격 정책
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              모든 요구사항에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-lg border-2 ${
                  plan.popular
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-medium">
                      인기
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-3"
                    >
                      <LuCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {plan.name === "Enterprise" ? (
                    <a
                      href="#contact"
                      className="block w-full text-center py-3 px-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <SignUpButton mode="modal">
                      <button className="w-full py-3 px-6 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        {plan.cta}
                      </button>
                    </SignUpButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

