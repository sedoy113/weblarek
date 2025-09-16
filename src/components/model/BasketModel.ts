import { IEvents } from '../base/Events';
import { ICard } from '../../types';

export class BasketModel {
	private _items: Map<string, ICard> = new Map();
	private _total = 0;
	private _itemCount = 0;
	private _cards: Map<string, ICard> = new Map(); // Кэш карточек для быстрого доступа

	constructor(private events: IEvents) {}

	/**
	 * Устанавливает данные карточек для пересчета суммы
	 */
	setCards(cards: ICard[]): void {
		// Обновляем кэш карточек
		this._cards = new Map(cards.map((card) => [card.id, card]));

		// Обновляем ссылки на карточки в корзине
		const updatedItems = new Map<string, ICard>();

		this._items.forEach((card, id) => {
			const updatedCard = this._cards.get(id);
			if (updatedCard) {
				updatedItems.set(id, updatedCard);
			}
		});

		this._items = updatedItems;
		this.updateTotal(false); // Не вызываем emitChange
	}

	addItem(card: ICard): boolean {
		if (this._items.has(card.id)) return false;

		this._items.set(card.id, card);
		this._itemCount++;
		this.updateTotal();

		this.emitChange();
		return true;
	}

	removeItem(id: string): boolean {
		if (!this._items.has(id)) return false;

		this._items.delete(id);
		this._itemCount--;
		this.updateTotal();

		this.emitChange();
		return true;
	}

	hasItem(id: string): boolean {
		return this._items.has(id);
	}

	getItem(id: string): ICard | undefined {
		return this._items.get(id);
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
	private updateTotal(emitEvent: boolean = true): void {
		const newTotal = Array.from(this._items.values()).reduce(
			(sum, card) => sum + (card?.price || 0),
			0
		);

		if (this._total !== newTotal) {
			this._total = newTotal;
			if (emitEvent) {
				this.emitChange();
			}
		}
	}

	get itemIds(): string[] {
		return Array.from(this._items.keys());
	}

	get items(): ICard[] {
		return Array.from(this._items.values());
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

	restore(state: BasketState, cards: ICard[]): void {
		this._cards = new Map(cards.map((card) => [card.id, card]));
		this._items = new Map();

		state.itemIds.forEach((id) => {
			const card = this._cards.get(id);
			if (card) {
				this._items.set(id, card);
			}
		});

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
