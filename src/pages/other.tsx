import React from "react";
import Link from "next/link";

import styles from "./other.module.css";

const Other: React.FC = () => {
  return (
    <div className={styles.butt}>
      <Link href="/">
        <a>meets</a>
      </Link>
    </div>
  );
};

export default Other;
