import React from "react";
import Link from "next/link";
import { css } from "astroturf";

const { butt } = css`
  .butt {
    background-color: aqua;
  }
`;

const Other: React.FC = () => {
  return (
    <div className={butt}>
      <Link href="/">
        <a>meets</a>
      </Link>
    </div>
  );
};

export default Other;
