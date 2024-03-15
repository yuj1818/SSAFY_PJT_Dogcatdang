import { useState, useEffect, lazy, Suspense, startTransition } from "react";
import { getNumberOfAnimals } from "../../util/SaveAPI";
import styled from "styled-components";
import { LoadingIndicator } from "../../components/common/Icons";
const SavedAnimalList = lazy(
  () => import("../../components/animalinfo/savedanimals/SavedAnimalList")
);

const Board = styled.div`
  display: flex;
  justify-content: space-around;

  .bold {
    font-family: "SUITE-Bold";
  }

  .bg-font {
    font-size: 4rem;
  }

  .md-font {
    font-size: 1.5rem;
  }
`;

const Line = styled.div`
  border-left: 1px solid black;
  height: inherit;
`;

const ListBox = styled.div`
  .ag-theme-alpine {
    text-align: center;
  }
  .ag-header-cell-label {
    justify-content: center;
  }
  .ag-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

function SavedAnimalManagementPage() {
  const [adoptedAnimals, setAdoptedAnimals] = useState();
  const [savedNum, setSavedNum] = useState();
  const [totalNum, setTotalNum] = useState();

  const getAnimalNums = async () => {
    const response = await getNumberOfAnimals();
    startTransition(() => {
      setAdoptedAnimals(response.adoptedAnimals);
      setSavedNum(response.protectedAnimals);
      setTotalNum(response.totalAnimals);
    });
  };

  useEffect(() => {
    getAnimalNums();
  }, []);
  console.log(savedNum);

  return (
    <div className="flex flex-col gap-8">
      <Board>
        <div className="flex flex-col items-center">
          <p className="bg-font bold">{savedNum}</p>
          <p className="bold md-font">보호 중</p>
        </div>
        <Line />
        <div className="flex flex-col items-center">
          <p className="bg-font bold">{adoptedAnimals}</p>
          <p className="bold md-font">입양 완료</p>
        </div>
        <Line />
        <div className="flex flex-col items-center">
          <p className="bg-font bold">{totalNum}</p>
          <p className="bold md-font">등록 동물 수</p>
        </div>
      </Board>
      <Suspense fallback={<LoadingIndicator />}>
        <ListBox>
          <SavedAnimalList />
        </ListBox>
      </Suspense>
    </div>
  );
}

export default SavedAnimalManagementPage;
