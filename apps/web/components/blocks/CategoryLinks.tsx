import Link from 'next/link';
import styles from './CategoryLinks.module.css';

export interface CategoryLinkItem {
  href: string;
  label: string;
  count: number;
}

/** Crawlable links to category landing pages, each with the number of properties it lists. */
export function CategoryLinks({
  heading,
  links,
}: {
  heading: string;
  links: readonly CategoryLinkItem[];
}) {
  if (links.length === 0) return null;

  return (
    <nav className={styles.root} aria-label={heading}>
      <h2 className={styles.title}>{heading}</h2>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={`badge ${styles.link}`}>
              {link.label} ({link.count})
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
