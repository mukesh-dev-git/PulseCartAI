"use client";
import { useEffect, useState } from "react";
import { SparklesIcon } from "./Icons";
import styles from "./NudgeToast.module.css";

export default function NudgeToast({ nudge, onDismiss, onAskAI }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!nudge) return;
    const showTimer = setTimeout(() => setVisible(true), 50);
    const duration = nudge.type === "hesitation" ? 8000 : 5000;
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [nudge, onDismiss]);

  if (!nudge) return null;

  const typeClass = styles[nudge.type] || "";

  const handleAskAI = () => {
    if (onAskAI && nudge.productName) {
      onAskAI(nudge.productName);
    }
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div className={`${styles.nudge} ${typeClass} ${visible ? styles.show : ""}`} role="alert">
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{nudge.icon}</span>
        <span className={styles.pulse} />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{nudge.title}</p>
        <p className={styles.msg}>{nudge.message}</p>
        {nudge.type === "hesitation" && (
          <button className={styles.askAiBtn} onClick={handleAskAI}>
            <SparklesIcon size={13} />
            Ask AI about this
          </button>
        )}
      </div>
      <button className={styles.dismiss} onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }} aria-label="Dismiss">✕</button>
    </div>
  );
}
