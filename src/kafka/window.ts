export class Window {
  id: string; //uuid
  startedTime: number; //epoch of window started time
  closedTime: number; //epoch of window closed time
  events: Event[]; //collections of event occured duing the window

  process() {
    //process collection messages
  }
}
