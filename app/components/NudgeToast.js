"use client";
import { useEffect, useState } from "react";
import styles from "./NudgeToast.module.css";

export default function NudgeToast({ nudge, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!nudge) return;
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 5s
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400); // wait for fade-out
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [nudge, onDismiss]);

  if (!nudge) return null;

  const typeClass = styles[nudge.type] || "";

  return (
    <div className={`${styles.nudge} ${typeClass} ${visible ? styles.show : ""}`} role="alert">
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{nudge.icon}</span>
        <span className={styles.pulse} />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{nudge.title}</p>
        <p className={styles.msg}>{nudge.message}</p>
      </div>
      <button className={styles.dismiss} onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }} aria-label="Dismiss">✕</button>
    </div>
  );
}
