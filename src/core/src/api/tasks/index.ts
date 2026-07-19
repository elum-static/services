import taskClaim from "./claim"
import taskCheck from "./check"
import taskList from "./list"
import taskPartnerList from "./partnerList"
import taskPartnerCheck from "./partnerCheck"
import taskStart from "./start"

class Tasks {
  public list = taskList
  public claim = taskClaim
  public check = taskCheck
  public start = taskStart

  // Партнёры
  public partnerList = taskPartnerList
  public partnerCheck = taskPartnerCheck
}

export default Tasks
