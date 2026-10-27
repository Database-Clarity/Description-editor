import type { ReactNode } from 'react';
import styles from './PlaceholderPage.module.scss';

interface PlaceholderPageProps {
  title: string;
  children: ReactNode;
}

export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>Clarity editor / v2 foundation</p>
      <h1>{title}</h1>
      <div className={styles.panel}>
        <p>{children}</p>
        <p className={styles.note}>
          This is a navigation preview. Data loading, editing, and account actions are not connected
          yet.
        </p>
      </div>
    </section>
  );
}
