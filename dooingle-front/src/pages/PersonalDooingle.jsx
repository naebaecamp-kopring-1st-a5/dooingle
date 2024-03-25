import Header from "../components/Header.jsx";
import ProfileImageFrame from "../components/ProfileImageFrame.jsx";
import Navigation from "../components/Navigation.jsx";
import DooingleAndCatch from "../components/DooingleAndCatch.jsx";
import DooinglerListAside from "../components/DooinglerListAside.jsx";
import {Link, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import { BACKEND_SERVER_ORIGIN } from "../env.js"

const sliceInitialState = {
  // initial state를 안 정해주면 에러 발생해서 렌더링이 안 됨
  size: 0,
  content: [],
  number: 0,
  sort: {},
  first: true,
  last: true,
  numberOfElements: 0,
  pageable: {},
  empty: true,
}

async function fetchDooinglesAndCatches(userLink, lastDooingleId = null) {
  const queryParameter = lastDooingleId === null ? "" : `?cursor=${lastDooingleId}`

  const response = await axios.get(`${BACKEND_SERVER_ORIGIN}/api/users/${userLink}/dooingles`.concat(queryParameter), {
    withCredentials: true, // ajax 요청에서 withCredentials config 추가
  });
  return response.data;
}

async function fetchIsFollowingUser(userLink) {
  const response = await axios.get(`${BACKEND_SERVER_ORIGIN}/api/follow/${userLink}`, {
    withCredentials: true, // ajax 요청에서 withCredentials config 추가
  });
  return response.data.isFollowingUser;
}

async function fetchAddFollow(userLink) {
  const response = await axios.post(
    `${BACKEND_SERVER_ORIGIN}/api/follow/${userLink}`,
    null,
    {withCredentials: true},
  );
  return response.data;
}

async function fetchCancelFollow(userLink) {
  const response = await axios.delete(`${BACKEND_SERVER_ORIGIN}/api/follow/${userLink}`, {
    withCredentials: true,
  });
  return response.data;
}

async function fetchAddDooingle(userLink, dooingleContent) {
  const addDooingleRequestBody = {
    content: dooingleContent
  }

  const response = await axios.post(
    `${BACKEND_SERVER_ORIGIN}/api/users/${userLink}/dooingles`,
    addDooingleRequestBody,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
}

export default function PersonalDooinglePage() {

  const [dooinglesAndCatchesSlice, setDooinglesAndCatchesSlice] = useState(sliceInitialState);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const params = useParams();
  const userLink = params?.userLink;
  const dooingleRef = useRef();

  useEffect(() => {
    fetchDooinglesAndCatches(userLink).then(data => {
      setDooinglesAndCatchesSlice(data)
    });

    fetchIsFollowingUser(userLink).then(result => {
      setIsFollowingUser(result)
    })
  }, [userLink]);

  function handleAddFollowButton() {
    fetchAddFollow(userLink).then(() => setIsFollowingUser(true))
  }

  function handleCancelFollowButton() {
    fetchCancelFollow(userLink).then(() => setIsFollowingUser(false))
  }

  function handleDooingleSubmit(event) {
    event.preventDefault(); // 폼 제출 기본 동작 방지

    const dooingleContent = dooingleRef.current.value;
    console.log(dooingleContent)

    fetchAddDooingle(userLink, dooingleContent)
  }

  return (
    <>
      <Header />

      {/* 소개 섹션 반투명 */}
      <section className="h-[10rem] bg-[#AAAAAA] shadow-[0_0.25rem__0.25rem_#888888]">
        <div className="grid grid-cols-12 gap-x-[2.5rem] mx-[8.75rem] min-h-full opacity-100">
          <div className="col-start-4 col-span-6 flex justify-start items-center">
            <ProfileImageFrame/>
            <div className="w-[3rem] h-[3rem] flex justify-center items-center">
              {isFollowingUser && <button onClick={handleCancelFollowButton}>★</button>}
              {!isFollowingUser && <button onClick={handleAddFollowButton}>☆</button>}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-x-[2.5rem] mx-[8.75rem] h-[4.5rem] ml-40px">
        {/* Feed와 배치 다른 부분: nav의 py가 3.75rem -> 3rem, 본문 섹션 py가 2.75rem -> 0.75rem */}

        {/* nav */}
        <nav className="col-start-1 col-span-3 flex justify-center text-[#5f6368]">
          <div className="flex flex-col items-center py-[3rem] gap-[1.25rem]">
            <Navigation />
          </div>
        </nav>

        {/* 뒹글 & 캐치 */}
        <section className="col-start-4 col-span-6 flex flex-col py-[0.75rem] text-[#5f6368]">
          <div className="flex px-[2rem] gap-[1.75rem] shadow-[inset_0_-0.125rem_0_0_#9aa1aa]">
            <div className="hover:shadow-[inset_0_-0.125rem_0_0_#fa61bd]">
              <button className="py-[0.5rem]">
                <div>
                  전체
                </div>
              </button>
            </div>
            <div className="hover:shadow-[inset_0_-0.125rem_0_0_#fa61bd]">
              <button className="py-[0.5rem]">
                <div>
                  아직 답변이 없는 뒹글
                </div>
              </button>
            </div>
          </div>

          <form
            className="flex justify-center items-center my-[2rem] gap-[4%]"
            onSubmit={handleDooingleSubmit}
          >
            <input
              type="text"
              ref={dooingleRef}
              placeholder="뒹글은 당신의 얼굴입니다."
              className="w-[70%] h-[5rem] border-[0.125rem] border-[#5f6368] rounded-[0.625rem] p-[1rem] focus:border-[0.2rem]"
            />
            <button type="submit"
                    className="max-w-fit bg-[#ef7ec2] p-[0.5rem] rounded-[0.625rem] text-white font-bold">
              굴려라~
            </button>
          </form>
          <div className="py-[1rem]">
            {dooinglesAndCatchesSlice.content.map(dooingleAndCatch => (
                <DooingleAndCatch
                    key={dooingleAndCatch.dooingleId}
                    ownerName={dooingleAndCatch.ownerName}
                    dooingleContent={dooingleAndCatch.content}
                    catchContent={dooingleAndCatch.catch.content}
                />
            ))}
          </div>
        </section>

        {/* aside */}
        <DooinglerListAside />

        <div className="col-start-1 col-span-12 mt-10">
          <Link to={"/"}>웰컴 페이지로</Link>
        </div>
      </div>
    </>
  );
}
