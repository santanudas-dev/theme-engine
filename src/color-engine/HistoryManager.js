/**
 * Linear undo/redo over whatever the engine generates. Deep-clones on the
 * way in and out so nothing downstream can mutate history by reference.
 */
export class HistoryManager {
  constructor() {
    this.past = [];
    this.current = null;
    this.future = [];
  }

  save(entry) {
    if (this.current) {
      this.past.push(structuredClone(this.current));
    }

    this.current = structuredClone(entry);
    this.future = [];

    return this.current;
  }

  prev() {
    if (!this.past.length) return this.current;

    this.future.unshift(structuredClone(this.current));
    this.current = this.past.pop();

    return this.current;
  }

  next() {
    if (!this.future.length) return this.current;

    this.past.push(structuredClone(this.current));
    this.current = this.future.shift();

    return this.current;
  }

  canPrev() {
    return this.past.length > 0;
  }

  canNext() {
    return this.future.length > 0;
  }
}
