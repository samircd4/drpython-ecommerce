import React from "react";
import { motion } from "framer-motion";
import { FaShippingFast, FaHeadset, FaMobileAlt, FaUsers } from "react-icons/fa";

const About = () => {
  // Variants for scroll-triggered animation
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Page Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-purple-700 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        About Sarker Shop
      </motion.h1>

      {/* Introduction */}
      <motion.p
        className="text-gray-700 text-center text-lg md:text-xl max-w-3xl mx-auto"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        Sarker Shop is your trusted e-commerce store in Bangladesh. We specialize in high-quality gadgets, mobile accessories, and
        <span className="font-semibold text-purple-600"> smartphones</span>. We combine quality products with excellent customer service, fast delivery, and secure payments.
      </motion.p>

      {/* Features / Our Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Feature 1: Fast Delivery */}
        <motion.div
          className="flex flex-col items-center p-6 bg-purple-50 rounded-lg shadow hover:shadow-lg transition"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FaShippingFast className="text-purple-600 text-4xl mb-4" />
          <h3 className="font-bold text-purple-700 text-xl mb-2">Fast Delivery</h3>
          <p className="text-gray-700 text-center">
            We ensure your orders, including smartphones, reach your doorstep quickly and safely.
          </p>
        </motion.div>

        {/* Feature 2: Customer Support */}
        <motion.div
          className="flex flex-col items-center p-6 bg-purple-50 rounded-lg shadow hover:shadow-lg transition"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FaHeadset className="text-purple-600 text-4xl mb-4" />
          <h3 className="font-bold text-purple-700 text-xl mb-2">Customer Support</h3>
          <p className="text-gray-700 text-center">
            Our support team is available 24/7 to help you with orders, inquiries, and smartphone support.
          </p>
        </motion.div>

        {/* Feature 3: Mobile Friendly */}
        <motion.div
          className="flex flex-col items-center p-6 bg-purple-50 rounded-lg shadow hover:shadow-lg transition"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FaMobileAlt className="text-purple-600 text-4xl mb-4" />
          <h3 className="font-bold text-purple-700 text-xl mb-2">Mobile Friendly</h3>
          <p className="text-gray-700 text-center">
            Shop easily from your smartphone or tablet — our site is fully responsive.
          </p>
        </motion.div>

        {/* Feature 4: Trusted by Customers */}
        <motion.div
          className="flex flex-col items-center p-6 bg-purple-50 rounded-lg shadow hover:shadow-lg transition"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FaUsers className="text-purple-600 text-4xl mb-4" />
          <h3 className="font-bold text-purple-700 text-xl mb-2">Trusted by Customers</h3>
          <p className="text-gray-700 text-center">
            Thousands of happy customers trust Sarker Shop for smartphones, gadgets, and excellent service.
          </p>
        </motion.div>
      </div>

      {/* Our Mission */}
      <motion.div
        className="bg-purple-50 p-8 rounded-lg text-center space-y-4"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-purple-700">Our Mission</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Our mission is to bring the best smartphones and gadgets to your hands with a seamless shopping experience. Sarker Shop stands for quality, trust, and customer happiness.
        </p>
      </motion.div>
    </div>
  );
};

export default About;
