import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import PokerRoom from "@/components/PokerRoom";
import type { NextPage } from "next";

const PokerRoomPage: NextPage = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      setRoomId(router.query.roomId as string);
      setUserName(router.query.user as string);
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Planning Poker</title>
      </Head>
      {roomId && userName && <PokerRoom room={roomId} name={userName} />}
    </>
  );
};

export default PokerRoomPage;
