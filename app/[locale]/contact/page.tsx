"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { personal } from "@/data/personal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            联系我
          </h1>
          <p className="text-secondary text-lg">期待与你交流</p>
        </motion.div>

        {/* Main content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Contact info */}
          <motion.div variants={itemVariants} className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <span>联系方式</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-secondary">📧</span>
                <a
                  href={`mailto:${personal.email}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {personal.email}
                </a>
              </div>
              {personal.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-secondary">📱</span>
                  <span className="text-foreground">{personal.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-secondary">📍</span>
                <span className="text-foreground">{personal.location}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-secondary mb-4">社交媒体</h4>
              <div className="flex gap-4">
                {personal.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg glass text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div variants={itemVariants} className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">发送消息</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-secondary mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-3 focus:border-primary/50 focus:outline-none text-foreground"
                  placeholder="你的姓名"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-secondary mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-3 focus:border-primary/50 focus:outline-none text-foreground"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm text-secondary mb-2">
                  消息
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-3 focus:border-primary/50 focus:outline-none text-foreground resize-none"
                  placeholder="想说些什么..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors font-medium"
              >
                发送
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              消息已发送，感谢你的联系！
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <span>←</span>
            <span>返回首页</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
