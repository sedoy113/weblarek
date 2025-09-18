import { IEvents } from '../base/Events';
import { BasketItem } from '../../types';

/**
 * Модель корзины для управления товарными позициями и расчетом стоимости
 */
export class BasketModel {
	/**
	 * Приватное свойство - коллекция товаров в корзине
	 */
	private _items: Map<string, BasketItem> = new Map();

	/**
	 * Общая стоимость товаров в корзине
	 */
	private _total = 0;

	/**
	 * Конструктор модели корзины
	 * @param events - экземпляр системы событий
	 */
	constructor(private events: IEvents) {}

	/**
	 * Добавляет товар в корзину
	 * @param item - данные товара для корзины
	 * @returns true, если товар успешно добавлен
	 */
	addItem(item: BasketItem): boolean {
		if (this._items.has(item.id)) return false;

		this._items.set(item.id, item);
		this.updateTotal();
		this.emitChange();
		return true;
	}

	/**
	 * Удаляет товар из корзины
	 * @param id - идентификатор товара
	 * @returns true, если товар успешно удален
	 */
	removeItem(id: string): boolean {
		if (!this._items.has(id)) return false;

		this._items.delete(id);
		this.updateTotal();
		this.emitChange();
		return true;
	}

	/**
	 * Проверяет наличие товара в корзине
	 * @param id - идентификатор товара
	 * @returns true, если товар существует в корзине
	 */
	hasItem(id: string): boolean {
		return this._items.has(id);
	}

	/**
	 * Получает данные товара из корзины
	 * @param id - идентификатор товара
	 * @returns данные товара или undefined
	 */
	getItem(id: string): BasketItem | undefined {
		return this._items.get(id);
	}

	/**
	 * Очищает корзину от всех товаров
	 */
	clear(): void {
		this._items.clear();
		this._total = 0;
		this.emitChange();
	}

	/**
	 * Пересчитывает общую стоимость товаров в корзине
	 * @private
	 */
	private updateTotal(): void {
		this._total = Array.from(this._items.values()).reduce(
			(sum, item) => sum + item.price,
			0
		);
	}

	/**
	 * Возвращает список идентификаторов товаров в корзине
	 */
	get itemIds(): string[] {
		return Array.from(this._items.keys());
	}

	/**
	 * Возвращает массив данных товаров в корзине
	 */
	get items(): BasketItem[] {
		return Array.from(this._items.values());
	}

	/**
	 * Возвращает общую стоимость товаров в корзине
	 */
	get total(): number {
		return this._total;
	}

	/**
	 * Возвращает количество товаров в корзине
	 */
	get itemCount(): number {
		return this._items.size;
	}

	/**
	 * Проверяет, пуста ли корзина
	 */
	get isEmpty(): boolean {
		return this._items.size === 0;
	}

	/**
	 * Отправляет событие об изменении корзины
	 * @private
	 */
	private emitChange(): void {
		this.events.emit('basket:changed', {
			itemIds: this.itemIds,
			total: this._total,
			itemCount: this.itemCount,
			isEmpty: this.isEmpty,
		});
	}

	/**
	 * Преобразует состояние корзины в сериализуемый объект
	 * @returns сериализованные данные корзины
	 */
	serialize(): Omit<BasketState, 'isEmpty'> {
		return {
			itemIds: this.itemIds,
			total: this._total,
			itemCount: this.itemCount,
		};
	}

	/**
	 * Восстанавливает состояние корзины из сохраненных данных
	 * @param state - сохраненное состояние корзины
	 * @param getItemData - функция для получения данных товара по ID
	 */
	restore(
		state: Omit<BasketState, 'isEmpty'>,
		getItemData: (id: string) => { price: number; title: string } | undefined
	): void {
		this._items = new Map();

		for (const id of state.itemIds) {
			const itemData = getItemData(id);
			if (itemData) {
				this._items.set(id, { id, ...itemData });
			} else {
				console.warn(`Данные для товара с ID ${id} не найдены`);
			}
		}

		this._total = state.total;
		this.emitChange();
	}
}

/**
 * Интерфейс состояния корзины
 */
interface BasketState {
	itemIds: string[];
	total: number;
	itemCount: number;
	isEmpty: boolean;
}
