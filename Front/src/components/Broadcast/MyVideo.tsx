import React, { useRef, useEffect, useState, ChangeEvent } from "react";
import { Session, StreamManager } from "openvidu-browser";
import styled from "styled-components";

import { RiFullscreenFill } from "react-icons/ri";
import { AiFillSound } from "react-icons/ai";
import { MdOutlinePictureInPictureAlt } from "react-icons/md";
import { isOrg } from "../../pages/users/SignInPage";
import { Button } from "../common/Button";
import { useNavigate } from "react-router-dom";
import AnimalList from "./AnimalList";
import Chat from "./Chat";
import BroadcastDetail from "./BroadcastDetail";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideoChat = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 20px;
  padding: 20px;
  width: 100%;
`;

const VideoContainer = styled.div`
  position: relative;
  text-align: center;
  max-height: 70vh;
  background-color: #121212;
`;

const FullscreenButtonContainer = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0px;
  border: none;
  cursor: pointer;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5%;
  padding: 0 2%;
`;

const GroupComtainer = styled.div`
  display: flex;

  button {
    margin-left: 1rem;
  }
`;

interface VideoProps {
  streamManager: StreamManager;
  leaveSession: () => void;
  session: Session;
}

const Video: React.FC<VideoProps> = ({
  streamManager,
  leaveSession,
  session,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
  }, []);

  const handleFullscreen = () => {
    const video = videoRef.current;

    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    }
  };

  const handleMouseEnter = () => {
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
    }
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    hideControlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const togglePictureInPicture = () => {
    console.log(videoRef.current);
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      videoRef.current
        ?.requestPictureInPicture()
        .then(() => {})
        .catch((error) => {
          console.error("Error entering PiP mode:", error);
        });
    }
  };

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return (
    <Container>
      <VideoChat>
        <VideoContainer
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            autoPlay={true}
            ref={videoRef}
            style={{ height: "100%", width: "100%" }}
          >
            <track kind="captions" />
          </video>
          {showControls && (
            <FullscreenButtonContainer>
              <GroupComtainer>
                <AiFillSound />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </GroupComtainer>
              <GroupComtainer>
                {!isOrg() && (
                  <button onClick={togglePictureInPicture}>
                    <MdOutlinePictureInPictureAlt />
                  </button>
                )}
                <button onClick={handleFullscreen}>
                  <RiFullscreenFill />
                </button>
              </GroupComtainer>
            </FullscreenButtonContainer>
          )}
          <Button
            onClick={() => {
              leaveSession();
              return navigate("/broadcast/list");
            }}
            $background="red"
          >
            종료하기
          </Button>
        </VideoContainer>
        <Chat session={session} />
      </VideoChat>
      <BroadcastDetail />
      <AnimalList togglePictureInPicture={togglePictureInPicture} />
    </Container>
  );
};

export default Video;
