import styles from "../../styles/PokerRoom.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFirebase } from "../../firebase/useFirebase";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "../../firebase/config";

interface PokerRoomProps {
  room: string;
  name: string;
}

const PokerRoom: React.FC<PokerRoomProps> = ({ room, name }) => {
  const router = useRouter();
  const queryRoomId = router.query.roomId;
  const [roomId, setRoomId] = useState(queryRoomId as string);
  const { data: roomData, setDataAtPath } = useFirebase(`rooms/${roomId}`);
  const [votes, setVotes] = useState<any>({});
  const [inviteURL, setInviteURL] = useState("");
  const [votesVisible, setVotesVisible] = useState(false);
  const [participants, setParticipants] = useState<{
    [key: string]: { voted: boolean; vote?: string; isAdmin?: boolean };
  }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<"normal" | "tshirt">("normal");

  useEffect(() => {
    if (roomData) {
      setVotes(roomData.votes || {});
    }
  }, [roomData]);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem("roomId", room);
    } else {
      const savedRoomId = localStorage.getItem("roomId");
      if (savedRoomId) {
        setRoomId(savedRoomId);
      } else {
        router.push("/");
      }
    }

    const roomRef = ref(database, `rooms/${roomId}/participants`);
    const listener = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        setParticipants(data || {});

        if (data && data[name]?.isAdmin) {
          setIsAdmin(true);
        }
      },
      { onlyOnce: false }
    );

    return () => {
      off(roomRef, "value", listener);
    };
  }, [roomId, name, room, router]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("roomId");
    };
  }, []);

  const toggleMode = () => {
    setMode(mode === "normal" ? "tshirt" : "normal");
  };

  const onVote = async (value: string | number) => {
    const roomRef = ref(database, `rooms/${roomId}/participants/${name}`);
    await update(roomRef, { voted: true, vote: String(value) });
  };

  const onRevealVotes = () => {
    setVotesVisible(true);
  };

  const onResetVotes = async () => {
    const updates: any = {};
    for (const user in participants) {
      updates[`rooms/${roomId}/participants/${user}/voted`] = false;
      updates[`rooms/${roomId}/participants/${user}/vote`] = null;
    }

    await update(ref(database), updates);
    setVotesVisible(false);
  };

  const generateInviteURL = () => {
    const currentURL = `${window.location.origin}/join-room/${roomId}`;
    setInviteURL(currentURL);
  };

  const normalOptions = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  const tshirtOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const renderVoteButtons = () => {
    return mode === "normal"
      ? normalOptions.map((value) => (
          <button
            key={value}
            className={`${styles.voteButton} ${styles.pokerCard}`}
            onClick={() => onVote(value)}
          >
            {value}
          </button>
        ))
      : tshirtOptions.map((value) => (
          <button
            key={value}
            className={`${styles.voteButton} ${styles.pokerCard}`}
            onClick={() => onVote(value)}
          >
            {value}
          </button>
        ));
  };

  return (
    <div className={styles.pokerRoom}>
      <h1>Scrum Poker Room</h1>
      <h2>Room ID: {roomId}</h2>
      <div className={styles.participants}>
        <h2>Participantes</h2>
        <ul>
          {Object.entries(participants).map(([name, { voted }]) => (
            <li key={name}>
              <span className={styles.participantName}>{name}</span>
              <span
                className={`${styles.voteStatus} ${
                  voted ? styles.voteStatusVoted : ""
                }`}
              />
            </li>
          ))}
        </ul>
      </div>

      {votesVisible ? (
        <div className={styles.voteResults}>
          {Object.entries(participants).map(([name, { vote }]) => (
            <div key={name} className={styles.voteResult}>
              <span className={styles.voteResultName}>{name}:</span>{" "}
              <span className={styles.voteResultValue}>{vote || "?"}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.voteButtons}>{renderVoteButtons()}</div>
      )}

      {isAdmin && (
        <div className={styles.adminButtons}>
          <button className={styles.revealButton} onClick={onRevealVotes}>
            Revelar
          </button>
          <button className={styles.resetButton} onClick={onResetVotes}>
            Reiniciar votación
          </button>
          <button className={styles.toggleModeButton} onClick={toggleMode}>
            {mode === "normal"
              ? "Cambiar a T-shirt sizes"
              : "Cambiar a modo normal"}
          </button>
          <button className={styles.inviteButton} onClick={generateInviteURL}>
            Invitar compañeros
          </button>
        </div>
      )}

      {inviteURL && (
        <div className={styles.inviteLinkContainer}>
          <p>Comparte este enlace para invitar a tus compañeros de equipo:</p>
          <input
            type="text"
            readOnly
            value={inviteURL}
            className={styles.inviteLink}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
};

export default PokerRoom;
