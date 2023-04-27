import styles from "../../styles/PokerRoom.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFirebase } from "../../firebase/useFirebase";
import { ref, onValue, off, update } from "firebase/database";
import { database } from "../../firebase/config";
import { useTranslation } from "next-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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
  const { t, i18n } = useTranslation();
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [storyURL, setStoryURL] = useState("");

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
    if (!roomId) return;

    const unsubscribe = onValue(
      ref(database, `rooms/${roomId}`),
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        setParticipants(data.participants || {});
        setVotes(data.votes || {});
        setVotesVisible(data.reveal || false);
        setMode(data.mode || "normal");
      }
    );

    return () => {
      off(ref(database, `rooms/${roomId}`), "value", unsubscribe);
    };
  }, [roomId]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("roomId");
    };
  }, []);

  useEffect(() => {
    if (roomId && roomData) {
      if (roomData.reveal) {
        setSelectedVote(null);
      }
      setVotesVisible(roomData.reveal || false);
    }
  }, [roomId, roomData]);

  const onSaveStoryURL = async () => {
    // Guardar la URL de la historia en Firebase
    await update(ref(database, `rooms/${roomId}`), { storyURL });
  };

  useEffect(() => {
    if (roomId && roomData) {
      setStoryURL(roomData.storyURL || "");
    }
  }, [roomId, roomData]);

  const toggleMode = async () => {
    const newMode = mode === "normal" ? "tshirt" : "normal";
    setMode(newMode);

    // Update mode state in Firebase
    await update(ref(database, `rooms/${roomId}`), { mode: newMode });

    // Reset reveal state in Firebase
    await update(ref(database, `rooms/${roomId}`), { reveal: false });
  };

  const onVote = async (value: string | number) => {
    setSelectedVote(String(value));
    const roomRef = ref(database, `rooms/${roomId}/participants/${name}`);
    await update(roomRef, { voted: true, vote: String(value) });
  };

  const onRevealVotes = async () => {
    setVotesVisible(true);

    // Update reveal state in Firebase
    await update(ref(database, `rooms/${roomId}`), { reveal: true });
  };

  const onResetVotes = async () => {
    const updates: any = {};
    for (const user in participants) {
      updates[`rooms/${roomId}/participants/${user}/voted`] = false;
      updates[`rooms/${roomId}/participants/${user}/vote`] = null;
    }

    await update(ref(database), updates);
    setVotesVisible(false);

    // Update reveal state in Firebase
    await update(ref(database, `rooms/${roomId}`), { reveal: false });
  };

  const generateInviteURL = () => {
    const currentURL = `${window.location.origin}/join-room/${roomId}`;
    setInviteURL(currentURL);
  };

  const formatStoryURL = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "http://" + url;
    }
    return url;
  };

  const normalOptions = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  const tshirtOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const renderVoteButtons = () => {
    return mode === "normal"
      ? normalOptions.map((value) => (
          <button
            key={value}
            className={`${styles.voteButton} ${styles.pokerCard} ${
              selectedVote === String(value) ? styles.voteButtonSelected : ""
            }`}
            onClick={() => onVote(value)}
          >
            {value}
          </button>
        ))
      : tshirtOptions.map((value) => (
          <button
            key={value}
            className={`${styles.voteButton} ${styles.pokerCard} ${
              selectedVote === String(value) ? styles.voteButtonSelected : ""
            }`}
            onClick={() => onVote(value)}
          >
            {value}
          </button>
        ));
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const prepareChartData = (participants: any) => {
    const voteCount: any = {};
    let voteSum = 0;
    let voteCountTotal = 0;

    Object.values(participants).forEach(({ vote }: any) => {
      if (vote) {
        voteCount[vote] = (voteCount[vote] || 0) + 1;
        voteSum += parseFloat(vote);
        voteCountTotal += 1;
      }
    });

    const data = Object.entries(voteCount).map(([vote, count]) => ({
      name: vote,
      count,
    }));

    const average = voteCountTotal ? (voteSum / voteCountTotal).toFixed(2) : 0;

    return { data, average };
  };

  const { data, average } = prepareChartData(participants);

  return (
    <div className={styles.pokerRoom}>
      <div className={styles.languageSelector}>
        <button onClick={() => changeLanguage("en")}>EN</button>
        <button onClick={() => changeLanguage("es")}>ES</button>
      </div>
      <h1>Scrum Poker Room</h1>
      <h2>Room ID: {roomId}</h2>
      <div className={styles.participants}>
        <h2>{t("participants")}</h2>
        <ul>
          {Object.entries(participants).map(([name, { voted, vote }]) => (
            <li key={name}>
              {votesVisible && vote !== null && (
                <span className={styles.voteResultValue}>{vote}&nbsp;</span>
              )}
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

      {storyURL && (
        <div className={styles.storyURLContainer}>
          <a
            href={formatStoryURL(storyURL)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.storyURL}
          >
            User Story: {storyURL}
          </a>
        </div>
      )}

      {votesVisible ? (
        <div className={styles.voteResults}>
          <div className={styles.barChartContainer}>
            <h3>Average Vote: {average}</h3>
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </div>
        </div>
      ) : (
        <div className={styles.voteButtons}>{renderVoteButtons()}</div>
      )}

      {isAdmin && (
        <div className={styles.adminButtons}>
          <div className={styles.storyURLInputContainer}>
            <input
              type="text"
              value={storyURL}
              onChange={(e) => setStoryURL(e.target.value)}
              placeholder="User Story URL"
              className={styles.storyURLInput}
            />
            <button
              className={styles.saveStoryURLButton}
              onClick={onSaveStoryURL}
            >
              {t("saveURL")}
            </button>
          </div>
          {!votesVisible && (
            <button className={styles.revealButton} onClick={onRevealVotes}>
              {t("reveal")}
            </button>
          )}
          {votesVisible && (
            <button className={styles.resetButton} onClick={onResetVotes}>
              {t("reset")}
            </button>
          )}
          <button className={styles.toggleModeButton} onClick={toggleMode}>
            {mode === "normal" ? t("tshirtMode") : t("normalMode")}
          </button>
          <button className={styles.inviteButton} onClick={generateInviteURL}>
            {t("invite")}
          </button>
        </div>
      )}

      {inviteURL && (
        <div className={styles.inviteLinkContainer}>
          <p>{t("share")}</p>
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
