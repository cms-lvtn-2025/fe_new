'use client'

import Link from 'next/link'
import { Button } from '@/components/common'
import { useTheme } from '@/lib/contexts/theme-context'

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm animate-slideInLeft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              BK
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">HCMUT Thesis Management</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Đại học Bách Khoa TP.HCM</p>
            </div>
          </div>
          <nav className="flex gap-3 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <Link href="/login">
              <Button variant="outline" size="sm">Đăng nhập</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-fadeIn">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-scaleIn">
          Hệ thống Quản lý Luận văn
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Đại học Bách Khoa - ĐHQG TP.HCM
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Nền tảng quản lý luận văn tốt nghiệp hiện đại, giúp sinh viên, giảng viên và
          khoa dễ dàng theo dõi, quản lý toàn bộ quy trình thực hiện luận văn
        </p>
        <div className="flex gap-4 justify-center animate-slideInRight">
          <Link href="/student">
            <Button size="lg">Dành cho Sinh viên</Button>
          </Link>
          <Link href="/teacher">
            <Button size="lg" variant="outline">Dành cho Giảng viên</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12 animate-fadeIn">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl mb-4">
              📝
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Quản lý đề tài
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Đăng ký, theo dõi và quản lý đề tài luận văn một cách dễ dàng và minh bạch
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 text-2xl mb-4">
              👥
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Kết nối hướng dẫn
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kết nối sinh viên với giảng viên hướng dẫn, trao đổi và báo cáo tiến độ
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Chấm điểm & đánh giá
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hệ thống chấm điểm, đánh giá luận văn theo tiêu chuẩn của trường
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-2xl mb-4">
              📅
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Quản lý lịch bảo vệ
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sắp xếp, thông báo lịch bảo vệ và hội đồng chấm luận văn
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer" style={{animationDelay: '0.4s'}}>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 text-2xl mb-4">
              📄
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Quản lý tài liệu
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Lưu trữ và quản lý tài liệu, báo cáo tiến độ, bản thảo luận văn
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeIn cursor-pointer" style={{animationDelay: '0.5s'}}>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl mb-4">
              📈
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Báo cáo & thống kê
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thống kê, báo cáo chi tiết về tiến độ và kết quả luận văn
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 text-white py-16 mt-20 animate-fadeIn">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Đăng nhập để trải nghiệm hệ thống quản lý luận văn hiện đại
          </p>
          <Link href="/login">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <p className="mb-2">© 2025 Đại học Bách Khoa - ĐHQG TP.HCM</p>
            <p className="text-sm text-gray-500 dark:text-gray-600">
              Hệ thống Quản lý Luận văn Tốt nghiệp
            </p>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 pt-4 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2 flex items-center justify-center gap-2">
              <span>Developed by</span>
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-400 dark:text-blue-300 font-semibold">ThaiLy</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a
                href="https://github.com/ThaiLyhcmut/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
              <span className="text-gray-600 dark:text-gray-700">•</span>
              <a
                href="mailto:lyvinhthai321@gmail.com"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>lyvinhthai321@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
