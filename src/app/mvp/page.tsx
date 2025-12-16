import { ProductInfo } from "@/components/mvp/ProductInfo";
import { FeatureDemo } from "@/components/mvp/FeatureDemo";
import { Pricing } from "@/components/mvp/Pricing";
import { ContactForm } from "@/components/mvp/ContactForm";
import { UserRegistration } from "@/components/mvp/UserRegistration";

export default function MVPPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              혁신적인 솔루션을 만나보세요
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              비즈니스를 한 단계 업그레이드하는 강력한 도구
            </p>
            <UserRegistration />
          </div>
        </div>
      </section>

      <ProductInfo />
      <FeatureDemo />
      <Pricing />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                문의하기
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                궁금한 점이 있으신가요? 언제든지 연락주세요
              </p>
            </div>
            <div className="p-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

