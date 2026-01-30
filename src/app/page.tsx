import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-start items-center bg-linear-to-b from-slate-900 via-teal-900 to-emerald-900 px-6 py-12">
      {/* Hero */}
      <section className="text-center max-w-xl space-y-4 mt-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-200">
          Split Bill Calculator{" "}
          <span className="text-green-700">Mudah dan Cepat</span>
        </h1>
        <p className="text-gray-200 text-lg sm:text-xl">
          Upload struk, hitung tagihan, dan bagikan hasilnya dengan temanmu!
        </p>
      </section>

      {/* Illustration Image */}
      <section className="mt-12 w-full max-w-md flex justify-center relative">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 shadow-lg rounded-2xl overflow-hidden">
          <Image
            src="/receipt.png"
            alt="Receipt Illustration"
            fill
            style={{ objectFit: "contain" }}
            className="transition-transform duration-500 hover:scale-105"
          />
        </div>
      </section>

      {/* Call-to-Action Button */}
      <Link
        href="/upload"
        className="mt-12 inline-block bg-green-700 text-white font-semibold px-10 py-4 rounded-2xl text-lg shadow-md hover:scale-105 hover:shadow-green-500/50 transition-transform duration-300"
      >
        📸 Mulai Sekarang
      </Link>

      {/* How it works section */}
      <section className="mt-16 bg-green-100/70 backdrop-blur-md rounded-2xl p-8 max-w-3xl w-full text-gray-900 shadow-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4">
          How it works:
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-lg sm:text-xl">
          <li>📸 Take a photo of the purchase receipt correctly.</li>
          <li>🕵️ Auto-detect items & prices</li>
          <li>💸 Choose split method</li>
          <li>💬 Share to WhatsApp</li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="mt-16 mb-8 text-gray-500 text-sm">
        &copy; 2026 SplitBill.app
      </footer>
    </main>
  );
}
