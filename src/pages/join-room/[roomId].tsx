import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../../styles/JoinRoom.module.scss";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/config";

const JoinRoomPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [userName, setUserName] = useState("");

  const joinRoom = async () => {
    if (!userName) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(`userName-${roomId}`, userName);
    }

    const roomRef = ref(database, `rooms/${roomId}/participants/${userName}`);
    await update(roomRef, { voted: false });

    router.push(`/poker-room/${roomId}?user=${userName}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Unirse a la sala</h1>
      <div className={styles.form}>
        <label htmlFor="username">Nombre:</label>
        <input
          id="username"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button
          className={styles.joinRoomButton}
          onClick={joinRoom}
          disabled={!userName}
        >
          Unirse a la sala
        </button>
      </div>
    </div>
  );
};

export default JoinRoomPage;
