import { IEvents } from '../base/Events';

/**
 * Модель корзины для управления товарами
 * Хранит только ID товаров, данные о товарах берутся из каталога
 */
export class BasketModel {
	// Приватные поля для хранения состояния
	private _items: Set<string> = new Set(); // Храним только ID товаров
	private _total = 0;
	private _itemCount = 0;

	/**
	 * Конструктор модели корзины
	 * @param events - система событий для уведомления об изменениях
	 */
	constructor(private events: IEvents) {}

	/**
	 * Добавляет товар в корзину
	 * @param id - идентификатор добавляемого товара
	 * @returns true если товар добавлен, false если уже есть в корзине
	 */
	addItem(id: string): boolean {
		if (this._items.has(id)) return false;

		this._items.add(id);
		this._itemCount++;

		this.emitChange();
		return true;
	}

	/**
	 * Удаляет товар из корзины
	 * @param id - идентификатор удаляемого товара
	 * @returns true если товар удален, false если не найден
	 */
	removeItem(id: string): boolean {
		if (!this._items.has(id)) return false;

		this._items.delete(id);
		this._itemCount--;

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
		this._items.clear();
		this._total = 0;
		this._itemCount = 0;

		this.emitChange();
	}

	/**
	 * Обновляет общую стоимость на основе данных о товарах
	 * @param cards - Map с данными о товарах (id -> цена)
	 */
	updateTotal(cards: Map<string, { price: number }>): void {
		this._total = Array.from(this._items.values()).reduce((sum, id) => {
			const item = cards.get(id);
			return sum + (item?.price ?? 0);
		}, 0);
	}

	/**
	 * Геттер для получения идентификаторов товаров
	 */
	get itemIds(): string[] {
		return Array.from(this._items);
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
	 * Проверяет, пуста ли корзина
	 */
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
