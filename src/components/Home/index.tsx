import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.scss";
import { push, ref, set } from "firebase/database";
import { database } from "../../firebase/config";
import { useTranslation } from "next-i18next";
import { getRandomMiniGameType, createMiniGame } from "../../utils/miniGameUtils";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const createRoom = async () => {
    const newRoomRef = push(ref(database, "rooms"));
    const roomId = newRoomRef.key || "";

    // Select random mini-game for this room
    const gameType = getRandomMiniGameType();
    const miniGame = createMiniGame(roomId, gameType);

    const newRoomData = {
      name: roomName,
      admin: userName,
      participants: { [userName]: { voted: false, isAdmin: true } },
      miniGame,
      explanationPhase: false, // Track when story explanation is happening
    };

    try {
      await set(newRoomRef, newRoomData);
      router.push(`/poker-room/${roomId}?user=${userName}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={styles.container}>
      <div className={styles.container}>
        <div className={styles.languageSelector}>
          <button onClick={() => changeLanguage("en")}>EN</button>
          <button onClick={() => changeLanguage("es")}>ES</button>
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>{t("welcome")}</h1>
          <div className={styles.form}>
            <label htmlFor="username">{t("name")}</label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="roomname">{t("roomName")}</label>
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
              {t("create")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
