import calendarGet from "./get"
import calendarList from "./list"
import calendarNext from "./next"
import calendarProgress from "./progress"
import calendarRecord from "./record"

class Calendar {
  public list = calendarList
  public get = calendarGet
  public progress = calendarProgress
  public next = calendarNext
  public record = calendarRecord
}

export default Calendar
