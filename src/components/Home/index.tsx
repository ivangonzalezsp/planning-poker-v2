import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { push, ref, set } from "firebase/database";
import { database } from "../../firebase/config";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const createRoom = async () => {
    const newRoomRef = push(ref(database, "rooms"));
    const roomId = newRoomRef.key || "";

    const newRoomData = {
      name: roomName,
      admin: userName,
      participants: { [userName]: { voted: false, isAdmin: true } },
    };

    try {
      await set(newRoomRef, newRoomData);
      router.push(`/poker-room/${roomId}?user=${userName}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Bienvenido a Planning Poker</h1>
          <div className={styles.form}>
            <label htmlFor="username">Nombre:</label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="roomname">Nombre de la sala:</label>
            <input
              id="roomname"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button
              className={styles.createRoomButton}
              onClick={createRoom}
              disabled={!userName || !roomName}
            >
              Crear sala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
