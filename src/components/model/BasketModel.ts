import { ICard } from '../../types';
import { IEvents } from '../base/events';

/**
 * Модель корзины для управления товарами
 * Отвечает за хранение состояния корзины и бизнес-логику работы с ней
 */
export class BasketModel {
	// Приватные поля для хранения состояния
	private _items: Map<string, ICard> = new Map(); // Используем Map для быстрого доступа
	private _total = 0;
	private _itemCount = 0;
	private cards: Map<string, ICard>; // Используем Map вместо массива для быстрого поиска

	/**
	 * Конструктор модели корзины
	 * @param events - система событий для уведомления об изменениях
	 * @param cards - массив всех доступных товаров
	 */
	constructor(private events: IEvents, cards: ICard[]) {
		// Преобразуем массив в Map для оптимизации поиска
		this.cards = new Map(cards.map((card) => [card.id, card]));
	}

	/**
	 * Добавляет товар в корзину
	 * @param id - идентификатор добавляемого товара
	 * @returns true если товар добавлен, false если не найден
	 */
	addItem(id: string): boolean {
		const source = this.cards.get(id);
		if (!source || source.inBasket) return false;

		// Обновляем статус товара
		source.inBasket = true;
		this._items.set(id, source);
		this._itemCount++;

		this.updateTotal();
		this.emitChange();
		return true;
	}

	/**
	 * Удаляет товар из корзины
	 * @param id - идентификатор удаляемого товара
	 * @returns true если товар удален, false если не найден
	 */
	removeItem(id: string): boolean {
		const source = this.cards.get(id);
		if (!source || !this._items.has(id)) return false;

		// Обновляем статус товара
		source.inBasket = false;
		this._items.delete(id);
		this._itemCount--;

		this.updateTotal();
		this.emitChange();
		return true;
	}

	/**
	 * Проверяет наличие товара в корзине
	 * @param id - идентификатор товара
	 */
	hasItem(id: string): boolean {
		return this._items.has(id);
	}

	/**
	 * Получает количество конкретного товара (в данной реализации всегда 1, но оставлено для расширения)
	 * @param id - идентификатор товара
	 */
	getItemQuantity(id: string): number {
		return this._items.has(id) ? 1 : 0;
	}

	/**
	 * Очищает корзину полностью
	 */
	clear(): void {
		// Сбрасываем статус всех товаров в корзине
		this._items.forEach((item) => {
			item.inBasket = false;
		});

		this._items.clear();
		this._total = 0;
		this._itemCount = 0;

		this.emitChange();
	}

	/**
	 * Геттер для получения товаров в корзине
	 */
	get items(): ICard[] {
		return Array.from(this._items.values());
	}

	/**
	 * Геттер для получения общей стоимости
	 */
	get total(): number {
		return this._total;
	}

	/**
	 * Геттер для получения количества товаров
	 */
	get itemCount(): number {
		return this._itemCount;
	}

	/**
	 * Геттер для получения идентификаторов товаров
	 */
	get itemIds(): string[] {
		return Array.from(this._items.keys());
	}

	/**
	 * Проверяет, пуста ли корзина
	 */
	get isEmpty(): boolean {
		return this._items.size === 0;
	}

	/**
	 * Приватный метод для пересчета общей стоимости
	 */
	private updateTotal(): void {
		this._total = Array.from(this._items.values()).reduce(
			(sum, item) => sum + (item.price ?? 0),
			0
		);
	}

	/**
	 * Приватный метод для отправки события изменения
	 */
	private emitChange(): void {
		this.events.emit('basket:changed', {
			items: this.items,
			total: this._total,
			itemCount: this._itemCount,
			isEmpty: this.isEmpty,
		});
	}

	/**
	 * Сериализует состояние корзины для передачи или сохранения
	 */
	serialize(): BasketState {
		return {
			itemIds: this.itemIds,
			total: this._total,
			itemCount: this._itemCount,
			isEmpty: this.isEmpty,
		};
	}

	/**
	 * Восстанавливает состояние корзины из сериализованных данных
	 * @param state - сериализованное состояние
	 */
	restore(state: BasketState): void {
		this.clear();

		state.itemIds.forEach((id) => {
			this.addItem(id);
		});
	}
}

/**
 * Интерфейс для сериализованного состояния корзины
 */
interface BasketState {
	itemIds: string[];
	total: number;
	itemCount: number;
	isEmpty: boolean;
}
