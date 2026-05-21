import { Link } from "react-router-dom";
import { PATH } from "../../../../../shared/constants/systemConstants";

export default function OrgManagement() {
  return (
    <div>
      <Link to={PATH.AUTH}>Login</Link>
    </div>
  );
}
