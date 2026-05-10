'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 每个字符的延迟（毫秒）
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 30, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const textRef = useRef(text);

  // 当打字完成时调用
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // 检测 text 变化并重置索引
    if (textRef.current !== text) {
      indexRef.current = 0;
      textRef.current = text;
      // 通过函数式更新重置 displayedText
      setDisplayedText(() => '');
      setIsComplete(() => false);
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        handleComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, handleComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1 h-4 bg-indigo-400 ml-1"
        />
      )}
    </span>
  );
}
