import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setEmail("");
      // You can add real subscription logic here
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-700 animate-gradient-x" />
      <div className="absolute inset-0 bg-black/20" /> {/* Light overlay for text */}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 md:p-12 gap-4 text-white">
        <h3 className="text-2xl md:text-3xl font-bold">
          Stay Updated
        </h3>
        <p className="text-sm md:text-lg max-w-md">
          Subscribe for exclusive deals and product updates. Join 5,000+ happy subscribers!
        </p>

        {/* Subscription Form */}
        <div className="relative w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            className="peer w-full md:w-64 px-4 py-3 rounded-lg border border-white/50 text-black focus:outline-none focus:ring-2 focus:ring-white placeholder-transparent"
          />
          <label className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-sm md:text-base pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-white/70 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-white peer-focus:text-sm">
            Enter your email
          </label>
        </div>

        <button
          onClick={handleSubscribe}
          className="mt-2 bg-white text-purple-600 px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold shadow-lg transition transform hover:-translate-y-1 hover:scale-105 hover:bg-purple-50"
        >
          {subscribed ? "Subscribed!" : "Subscribe"}
        </button>

        {/* Optional Social Proof */}
        <p className="text-xs md:text-sm text-white/80 mt-2">
          You're joining 5,000+ subscribers!
        </p>
      </div>

      {/* Tailwind custom animation */}
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 8s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Newsletter;
