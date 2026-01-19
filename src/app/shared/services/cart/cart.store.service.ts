import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  // source signal
  private readonly _count = signal<number>(0);

  // public readonly signal
  readonly count = this._count.asReadonly();

  // optional computed (future-ready)
  readonly hasItems = computed(() => this._count() > 0);

  increase(qty: number = 1) {
    this._count.update(count => count + qty);
  }

  decrease(qty: number = 1) {
    this._count.update(count => Math.max(0, count - qty));
  }

  set(count: number) {
    this._count.set(count);
  }
}
