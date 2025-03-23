import Link from "next/link";
import styles from './Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li><Link href="/">Forsíða</Link></li>
        <li><Link href="/flokkar">Flokkar</Link></li>
        <li><Link href="/flokkar-styring">Breyta flokkum</Link></li>
        <li><Link href="/ny-spurning">Búa til spurningu</Link></li>
        <li><Link href="/breyta-spurning">Breyta spurningu</Link></li>
      </ul>
    </nav>
  );
}
