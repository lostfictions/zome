import React, { useEffect, useState } from "react";
import Link from "next/link";
import styled, { css } from "astroturf";

import { withApollo } from "~/apollo/client";
import PostList from "~/components/PostList";

const { button } = css`
  .button {
    color: black;
    border: 1px solid black;
    background-color: white;
    display: inline-block;
  }
`;

const Butt = styled.div`
  background-color: lime;
`;

const Whatever = styled.button<{ primary?: boolean; color?: "green" }>`
  color: black;
  border: 1px solid black;
  background-color: white;

  &.primary {
    background-color: blue;
    border: 1px solid blue;
  }

  &.color-green {
    color: green;
  }
`;

const Index: React.FC = () => {
  const [primary, setPrimary] = useState(false);
  useEffect(() => {
    const x = setInterval(() => setPrimary(!primary), 1000);
    return () => clearInterval(x);
  }, [primary, setPrimary]);

  return (
    <Butt>
      <Link href="/other">
        <a>meets</a>
      </Link>
      <div className={button}>greets</div>
      <Whatever primary={primary} color="green">
        sdoi
      </Whatever>
      <PostList />
    </Butt>
  );
};

export default withApollo(Index);
