import { useState, useEffect, useCallback } from "react";
import {
  OpenVidu,
  Session as OVSession,
  Publisher,
  Subscriber,
} from "openvidu-browser";
import axios, { AxiosError } from "axios";
import BroadcastForm from "../../components/Broadcast/BroadcastForm";
import SessionComponent from "../../components/Broadcast/SessionComponent";
import { isOrg as org } from "../users/SignInPage";
import { getUserInfo } from "../../util/uitl";
import { broadcastEnd } from "../../util/broadcastAPI";
import { decrypt } from "../../components/Broadcast/simpleEncrypt";
import { queryClient } from "../../util/tanstackQuery";

const OPENVIDU_SERVER_URL = "https://i10e202.p.ssafy.io:8443/openvidu/api";
const OPENVIDU_SERVER_SECRET = import.meta.env.VITE_OPENVIDU_SERVER_SECRET;

const BroadCastPage: React.FC = () => {
  const [session, setSession] = useState<OVSession | undefined>(undefined);
  const [sessionId, setSessionId] = useState("");
  const [subscriber, setSubscriber] = useState<Subscriber | undefined>(
    undefined
  );
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [OV, setOV] = useState<OpenVidu | undefined>(undefined);

  const leaveSession = useCallback(() => {
    if (session) {
      session.signal({
        data: `${getUserInfo().nickname}님이 퇴장하였습니다.`,
        to: [],
        type: "signal:enter",
      });
      if (decrypt(sessionId.slice(0, -10)) === getUserInfo().username) {
        session.signal({
          data: "방송 종료",
          to: [],
          type: "streamDestroyed",
        });
      }

      session.disconnect();
      setOV(undefined);
      setSession(undefined);
      setSessionId("");
      setSubscriber(undefined);
      setPublisher(undefined);
    }
    queryClient.invalidateQueries({ queryKey: ["broadcastList"] });
    if (
      sessionId &&
      decrypt(sessionId.slice(0, -10)) === getUserInfo().username
    ) {
      broadcastEnd({ sessionId });
    }
  }, [session, sessionId]);

  useEffect(() => {
    const handleBack = () => {
      if (!document.pictureInPictureElement) {
        leaveSession();
      }
    };
    window.addEventListener("beforeunload", leaveSession);
    window.addEventListener("popstate", handleBack);
    return () => {
      if (
        decrypt(sessionId.slice(0, -10)) === getUserInfo().username ||
        !document.pictureInPictureElement
      ) {
        leaveSession();
      }
      window.removeEventListener("beforeunload", leaveSession);
      window.removeEventListener("popstate", handleBack);
    };
  }, [sessionId]);

  const joinSession = useCallback(() => {
    if (session || OV) {
      return;
    }
    const newOV = new OpenVidu();
    newOV.enableProdMode();
    setOV(newOV);
    setSession(newOV.initSession());
  }, []);

  const getToken = useCallback(async (): Promise<string> => {
    const createSession = async (sessionIds: string): Promise<string> => {
      try {
        const data = JSON.stringify({ customSessionId: sessionIds });
        const response = await axios.post(
          `${OPENVIDU_SERVER_URL}/sessions`,
          data,
          {
            headers: {
              Authorization: `Basic ${btoa(OPENVIDU_SERVER_SECRET)}`,
              "Content-Type": "application/json",
              withCredentials: true,
            },
          }
        );
        return (response.data as { id: string }).id;
      } catch (error) {
        const errorResponse = (error as AxiosError)?.response;
        if (errorResponse?.status === 409) {
          return sessionIds;
        }
        return "";
      }
    };
    const createToken = async (sessionIds: string): Promise<string> => {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/sessions/${sessionIds}/connection`,
        "{}",
        {
          headers: {
            Authorization: `Basic ${btoa(OPENVIDU_SERVER_SECRET)}`,
            "Content-Type": "application/json",
            withCredentials: true,
          },
        }
      );
      return response.data.token;
    };

    try {
      const newSessionId = await createSession(sessionId);
      if (!newSessionId) {
        throw Error("Failed to create session");
      }
      const token = await createToken(newSessionId);
      return token;
    } catch (error) {
      throw new Error("Failed to get token.");
    }
  }, [sessionId]);

  const sessionIdChangeHandler = useCallback((id: string) => {
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    session.on("streamCreated", (event) => {
      const newSubscriber = session.subscribe(event.stream, undefined);
      setSubscriber(newSubscriber);
    });

    const isOrg = org();
    const { id, username } = getUserInfo();

    if (isOrg) {
      getToken().then((token) => {
        session.connect(token, { nickname: username, id }).then(() => {
          if (OV) {
            const newPublisher = OV.initPublisher(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              frameRate: 10,
              mirror: false,
            });

            setPublisher(newPublisher);
            session.publish(newPublisher);
          }
        });
      });
    } else {
      getToken().then((token) => {
        session.connect(token).then(() => {
          session.signal({
            data: `${getUserInfo().nickname}님이 입장하였습니다.`,
            to: [],
            type: "signal:enter",
          });
        });
      });
    }
  }, [session, OV, sessionId, getToken]);

  return (
    <div>
      <>
        {session ? (
          <SessionComponent
            leaveSession={leaveSession}
            publisher={publisher as Publisher}
            subscriber={subscriber!}
            session={session}
          />
        ) : (
          <BroadcastForm
            sessionIdChangeHandler={sessionIdChangeHandler}
            joinSession={joinSession}
            sessionId={sessionId}
          />
        )}
      </>
    </div>
  );
};

export default BroadCastPage;
