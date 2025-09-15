import { IEvents } from '../base/Events';
import { ICard } from '../../types';

export class BasketModel {
	private _items: Set<string> = new Set();
	private _total = 0;
	private _itemCount = 0;
	private _cards: ICard[] = []; // Храним ссылку на карточки для пересчета

	constructor(private events: IEvents) {}

	/**
	 * Устанавливает данные карточек для пересчета суммы
	 */
	setCards(cards: ICard[]): void {
		this._cards = cards;
	}

	addItem(id: string): boolean {
		if (this._items.has(id)) return false;

		this._items.add(id);
		this._itemCount++;
		this.updateTotal(); // Автоматически обновляем сумму при добавлении

		this.emitChange();
		return true;
	}

	removeItem(id: string): boolean {
		if (!this._items.has(id)) return false;

		this._items.delete(id);
		this._itemCount--;
		this.updateTotal(); // Автоматически обновляем сумму при удалении

		this.emitChange();
		return true;
	}

	hasItem(id: string): boolean {
		return this._items.has(id);
	}

	getItemQuantity(id: string): number {
		return this._items.has(id) ? 1 : 0;
	}

	clear(): void {
		this._items.clear();
		this._total = 0;
		this._itemCount = 0;

		this.emitChange();
	}

	/**
	 * Обновляет общую стоимость на основе текущих данных о товарах
	 */
	updateTotal(): void {
		const newTotal = this.itemIds.reduce((sum, id) => {
			const card = this._cards.find((c) => c.id === id);
			return sum + (card?.price || 0);
		}, 0);

		// Обновляем total только если значение изменилось
		if (this._total !== newTotal) {
			this._total = newTotal;
		}
	}

	get itemIds(): string[] {
		return Array.from(this._items);
	}

	get total(): number {
		return this._total;
	}

	get itemCount(): number {
		return this._itemCount;
	}

	get isEmpty(): boolean {
		return this._items.size === 0;
	}

	/**
	 * Приватный метод для отправки события изменения
	 */
	private emitChange(): void {
		this.events.emit('basket:changed', {
			itemIds: this.itemIds,
			total: this._total,
			itemCount: this._itemCount,
			isEmpty: this.isEmpty,
		});
	}

	serialize(): BasketState {
		return {
			itemIds: this.itemIds,
			total: this._total,
			itemCount: this._itemCount,
			isEmpty: this.isEmpty,
		};
	}

	restore(state: BasketState): void {
		this._items = new Set(state.itemIds);
		this._total = state.total;
		this._itemCount = state.itemCount;
		this.emitChange();
	}
}

interface BasketState {
	itemIds: string[];
	total: number;
	itemCount: number;
	isEmpty: boolean;
}
