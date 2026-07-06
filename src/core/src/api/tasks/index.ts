import calendarClaim from "./claim"
import taskCheck from "./check"
import calendarList from "./list"
import taskPartnerCheck from "./partnerCheck"
import taskPartnerList from "./partnerList"

class Task {
  public list = calendarList
  public claim = calendarClaim
  public check = taskCheck
  public partnerList = taskPartnerList
  public partnerCheck = taskPartnerCheck
}

export default Task
