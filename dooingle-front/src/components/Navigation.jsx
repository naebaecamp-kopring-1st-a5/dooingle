import {Link} from "react-router-dom";

export default function Navigation() {
  return (
    <div className="flex flex-col items-center gap-[1rem]">
      <div>
        <Link to="/personal-dooingles">내 뒹글함</Link>
      </div>
      <div>
        <a href="#">팔로우하는 뒹글러</a>
      </div>
      <div>
        <a href="#">뒹글 탐색</a>
      </div>
    </div>
  );
}
