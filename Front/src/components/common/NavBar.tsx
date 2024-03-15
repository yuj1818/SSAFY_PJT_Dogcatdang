import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { isOrg as org } from "../../pages/users/SignInPage";
import { Bell } from "./Icons";
import tw from "tailwind-styled-components";
import { logout } from "../../util/UserAPI";
import logo from "../../assets/main-logo.webp";
import { getUserInfo } from "../../util/uitl";
import Footer from "./Footer";
import { useQuery } from "@tanstack/react-query";
import { requestNoti } from "../../util/notificationsAPI";
import { retryFn } from "../../util/tanstackQuery";
import { Contour } from "./Design";

// -----------Styled Component-----------------------------------------------
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const IMG = tw.img`
  mt-4 ms-4
`;

const NavBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  margin-right: 10rem;
  margin-bottom: 0px;
  height: 130px;

  @media screen and (max-width: 1024px) {
    .container {
      width: 80%;
    }
  }
`;

const FlexColumnContainer = styled.div`
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
`;

const StyledDiv = styled.span`
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;

  p,
  a,
  button {
    padding: 0 1rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: inherit;
  padding: 0 1rem;
  margin: 10px 0;
  font-size: 1.2rem;

  &.active {
    font-weight: bold;
  }
`;

interface OutLetInterface {
  $isPathWithoutDomain: boolean;
}

const OutLet = styled.div<OutLetInterface>`
  position: relative;
  min-width: "700px";
  flex: 1;

  margin-left: ${(props) => (props.$isPathWithoutDomain ? "0" : "1rem")};
  margin-right: ${(props) => (props.$isPathWithoutDomain ? "0" : "1rem")};
  @media (min-width: 640px) {
    margin-left: ${(props) => (props.$isPathWithoutDomain ? "0" : "15rem")};
    margin-right: ${(props) => (props.$isPathWithoutDomain ? "0" : "15rem")};
  }
`;

const NavTitle = styled.ul`
  list-style: none;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;

  li {
    flex-grow: 1;
    text-align: center;
    padding: 15px 0px;
    width: 100%;
    height: 100%;
  }
  li:hover {
    box-shadow: 0 -3px 0 0 #f9d29b inset;
  }
`;

// -----------NavBar-----------------------------------------------
const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isPathWithoutDomain = currentPath === "/";
  const [isNoti, setIsNoti] = useState(0);
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: requestNoti,
    staleTime: 10 * 1000,
    retry: retryFn,
    retryDelay: 300,
  });

  useEffect(() => {
    setIsNoti(0);
    if (data) {
      for (const element of data) {
        if (!element.isRead) {
          setIsNoti((prev) => prev + 1);
        }
      }
    }
  }, [data]);

  const isOrg = org();

  const onClickLogout = async () => {
    await logout();
    navigate("/landing");
  };

  const navTitles = isOrg ? (
    <NavTitle>
      <li>
        <StyledNavLink to="/save-animals" aria-label="보호 동물">
          보호 동물
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/broadcast/list" aria-label="보호 동물 방송">
          보호 동물 방송
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/lost-animals" aria-label="실종 동물">
          실종 동물
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink
          to={`/visit/${getUserInfo().id}`}
          aria-label="방문 일정 보기"
        >
          방문 일정 보기
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/articles/1" aria-label="입양 후 이야기">
          입양 후 이야기
        </StyledNavLink>
      </li>
    </NavTitle>
  ) : (
    <NavTitle>
      <li>
        <StyledNavLink to="/save-animals" aria-label="보호 동물">
          보호 동물
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/broadcast/list" aria-label="방송 시청">
          방송 시청
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/lost-animals" aria-label="실종 동물">
          실종 동물
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/articles/1" aria-label="입양 후 이야기">
          입양 후 이야기
        </StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/mung" aria-label="멍BTI">
          멍BTI
        </StyledNavLink>
      </li>
    </NavTitle>
  );

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "");
    setNickname(() => userInfo.nickname);
    setUserId(() => userInfo.id);
  }, []);

  return (
    <Container>
      <NavBarContainer>
        <StyledNavLink to="/">
          <IMG
            src={logo}
            alt="메인화면으로"
            className="w-40 min-w-40"
            loading="lazy"
          />
        </StyledNavLink>
        <FlexColumnContainer>
          <StyledDiv>
            {isOrg && <p style={{ margin: 0 }}>기관 회원</p>}
            <StyledNavLink to={`profile/${userId}`}>{nickname}님</StyledNavLink>
            <StyledNavLink to="notification">
              <Bell isNoti={isNoti} />
            </StyledNavLink>
            <button onClick={onClickLogout}>로그아웃</button>
          </StyledDiv>
          {navTitles}
        </FlexColumnContainer>
      </NavBarContainer>
      {isPathWithoutDomain && <Contour />}
      <OutLet $isPathWithoutDomain={isPathWithoutDomain}>
        <Outlet />
      </OutLet>
      {!isPathWithoutDomain && <Footer />}
    </Container>
  );
};

export default NavBar;
