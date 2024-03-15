import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import LikeButton from "../../../components/animalinfo/LikeButton";
import { useEffect, useState } from "react";

export interface SaveAnimal {
  animalId: number;
  code: string;
  animalType: string;
  breed: string;
  age: number;
  weight: string;
  rescueDate: string;
  selectedCity: string;
  selectedDistrict: string;
  detailInfo: string;
  isNeuter: string;
  gender: string;
  feature: string;
  state: string;
  imgUrl: string;
  userNickname: string;
  like: boolean;
  rescueLocation: string;
  adoptionApplicantCount: number;
}

interface AnimalCardProps {
  animals: SaveAnimal;
}

export const Card = styled.div`
  background-color: rgb(255, 255, 255);
  border: 1px solid #ccc;
  padding: 5px 20px 15px 20px;
  position: relative;
  box-shadow: 2px 2px 2px rgb(45, 45, 45, 0.4);
  border-radius: 10px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 7px 7px 7px rgba(0, 0, 0, 0.3);
  }
`;

export const Adoption = styled.div`
  font-size: 8px;
  background-color: #ff8331;
  color: white;
  border: 1px solid white;
  padding: 5px;
  position: absolute;
  right: 10%;
  top: 10%;
`;

function SaveAnimalCard(props: AnimalCardProps) {
  const [liked, setLiked] = useState(props.animals.like);
  const navigate = useNavigate();

  useEffect(() => {
    setLiked(props.animals.like);
  }, [props.animals.like]);

  const gotoDetailPage = () => {
    navigate(`/save-animals/${props.animals.animalId}`);
  };
  const handleToggleLike = () => {
    setLiked(!liked);
  };

  function getShortenedLocation(fullLocation: string) {
    const parts = fullLocation.split(" ");

    const shortenedLocation = parts.slice(0, 2).join(" ");
    return shortenedLocation;
  }
  const neuterStatus =
    props.animals.isNeuter === "예"
      ? "완료"
      : props.animals.isNeuter === "아니오"
      ? "미완료"
      : "알 수 없음";

  return (
    <Card>
      <Adoption>입양희망자: {props.animals.adoptionApplicantCount}</Adoption>
      <div onClick={gotoDetailPage}>
        <div style={{ fontSize: "10px" }}>
          보호 기관 : {props.animals.userNickname}
        </div>
        <img
          src={props.animals.imgUrl}
          alt="이미지 등록"
          style={{
            border: "1px solid #ccc",
            width: "100%",
            height: "120px",
          }}
        ></img>

        <div>
          <strong className="md-font">{props.animals.breed}</strong> |{" "}
          <strong  className="md-font">
            {props.animals.age === -1 ? "나이 미상" : `${props.animals.age} 살`}
          </strong>
        </div>
        <p style={{ fontSize: "13px" }}>
          {props.animals.gender} | 중성화 {neuterStatus}
        </p>

        <p style={{ fontSize: "10px", opacity: "0.7" }}>
          지역 : {getShortenedLocation(props.animals.rescueLocation)}
        </p>
      </div>

      <div style={{ position: "absolute", right: "8%", bottom: "4%" }}>
        <LikeButton
          animalId={props.animals.animalId}
          isActive={liked}
          onToggle={handleToggleLike}
        ></LikeButton>
      </div>
    </Card>
  );
}

export default SaveAnimalCard;
