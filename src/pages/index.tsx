import React, { useEffect, useState } from "react";
import Link from "next/link";
import styled, { css } from "astroturf";
import gql from "graphql-tag";

import { withApollo } from "~/apollo/with-apollo";
import { useMeQuery } from "~/apollo/generated/client";
import PostList from "~/components/PostList";

gql`
  query Me {
    me {
      id
      username
      avatar
    }
  }
`;

const { button, icongroup, avatar } = css`
  .button {
    color: black;
    border: 1px solid black;
    background-color: white;
    display: inline-block;
  }

  .icongroup {
    display: flex;
    flex-direction: column;
    width: 96px;
    align-items: center;
  }

  .avatar {
    border-radius: 50%;
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

const getAvatar = (id: string, avatar?: string | null) => {
  if (!avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(id) % 5}.png`;
  }
  const ext = avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}`;
};

const UserIcon: React.FC = () => {
  const { data, loading, error } = useMeQuery();

  let icon;
  if (loading) {
    icon = <div>...</div>;
  } else if (error) {
    icon = <div>{JSON.stringify(error)}</div>;
  } else if (data && data.me) {
    icon = (
      <div className={icongroup}>
        <img className={avatar} src={getAvatar(data.me.id, data.me.avatar)} />
        <span>{data.me.username}</span>
      </div>
    );
  } else {
    icon = (
      <div>
        <a href="/api/login?return_to=/">login</a>
      </div>
    );
  }

  return <div>{icon}</div>;
};

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
      <UserIcon />
    </Butt>
  );
};

export default withApollo(Index);
