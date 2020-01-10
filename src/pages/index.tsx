import React from "react";
import Link from "next/link";
import styled, { css } from "astroturf";
import gql from "graphql-tag";

import { withApollo } from "~/client/with-apollo";
import { useMeQuery } from "~/client/generated/apollo-client";
import Dropzone from "~/components/Dropzone";

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

const getAvatar = (id: string, avatarId?: string | null) => {
  if (!avatarId) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(id) % 5}.png`;
  }
  const ext = avatarId.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${avatarId}.${ext}`;
};

const UserIcon: React.FC = () => {
  const { data, loading, error } = useMeQuery();

  let icon;
  if (loading) {
    icon = <div>...</div>;
  } else if (error) {
    console.warn(error);
    icon = <div>{JSON.stringify(error)}</div>;
  } else if (data?.me) {
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
  return (
    <Butt>
      <Dropzone />
      <Link href="/other">
        <a>meets</a>
      </Link>
      <div className={button}>greets</div>
      <UserIcon />
    </Butt>
  );
};

export default withApollo(Index);
