import React from "react";
import Link from "next/link";

import styles from "./index.module.css";

const Index: React.FC = () => {
  return (
    <div className={styles.butt}>
      <Link href="/other">
        <a>meets</a>
      </Link>
    </div>
  );
};

export default Index;
