import { IEvents } from '../base/Events';
import { ICard } from '../../types';

/**
 * Модель корзины для управления товарными позициями и расчетом стоимости
 */
export class BasketModel {
	/**
	 * Приватное свойство - коллекция товаров в корзине (Map для эффективного доступа)
	 */
	private _items: Map<string, ICard> = new Map();

	/**
	 * Общая стоимость товаров в корзине
	 */
	private _total = 0;

	/**
	 * Кэш карточек товаров для быстрого доступа
	 */
	private _cards: Map<string, ICard> = new Map();

	/**
	 * Конструктор модели корзины
	 * @param events - экземпляр системы событий
	 */
	constructor(private events: IEvents) {}

	/**
	 * Обновляет кэш карточек и синхронизирует корзину с актуальными данными
	 * @param cards - массив новых карточек
	 */
	setCards(cards: ICard[]): void {
		// Обновляем кэш карточек
		this._cards = new Map(cards.map((card) => [card.id, card]));

		// Обновляем корзину, используя актуальные данные из кэша
		const updatedItems = new Map<string, ICard>();
		for (const [id] of this._items.entries()) {
			const updatedCard = this._cards.get(id);
			if (updatedCard) {
				updatedItems.set(id, updatedCard);
			} else {
				console.warn(`Карточка с ID ${id} отсутствует в кэше`);
			}
		}

		this._items = updatedItems;
		this.updateTotal(false); // Пересчет суммы без эмита события
	}

	/**
	 * Добавляет товар в корзину
	 * @param card - карточка товара
	 * @returns true, если товар успешно добавлен
	 */
	addItem(card: ICard): boolean {
		// Проверяем наличие карточки в кэше перед добавлением
		if (!this._cards.has(card.id)) {
			console.warn(`Карточка с ID ${card.id} отсутствует в кэше`);
			return false;
		}

		if (this._items.has(card.id)) return false;

		this._items.set(card.id, card);
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
	 * Получает карточку товара из корзины
	 * @param id - идентификатор товара
	 * @returns карточка товара или undefined
	 */
	getItem(id: string): ICard | undefined {
		return this._items.get(id);
	}

	/**
	 * Возвращает количество товара в корзине (всегда 1 штука за ID)
	 * @param id - идентификатор товара
	 * @returns 1 или 0
	 */
	getItemQuantity(id: string): number {
		return this._items.has(id) ? 1 : 0;
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
	 * @param emitEvent - флаг отправки события об изменении
	 */
	private updateTotal(emitEvent: boolean = true): void {
		const newTotal = Array.from(this._items.values()).reduce(
			(sum, card) => sum + (card.price || 0),
			0
		);

		if (this._total !== newTotal) {
			this._total = newTotal;
			if (emitEvent) {
				this.emitChange();
			}
		}
	}

	/**
	 * Возвращает список идентификаторов товаров в корзине
	 */
	get itemIds(): string[] {
		return Array.from(this._items.keys());
	}

	/**
	 * Возвращает массив карточек товаров в корзине
	 */
	get items(): ICard[] {
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
		return this._items.size; // Используем размер Map вместо отдельного счетчика
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
			itemCount: this._items.size, // Используем размер Map
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
			itemCount: this._items.size, // Используем размер Map
		};
	}

	/**
	 * Восстанавливает состояние корзины из сохраненных данных
	 * @param state - сохраненное состояние корзины
	 * @param cards - массив актуальных карточек
	 */
	restore(state: Omit<BasketState, 'isEmpty'>, cards: ICard[]): void {
		this._cards = new Map(cards.map((card) => [card.id, card]));
		this._items = new Map();

		for (const id of state.itemIds) {
			const card = this._cards.get(id);
			if (card) {
				this._items.set(id, card);
			} else {
				console.warn(`Карточка с ID ${id} отсутствует в кэше`);
			}
		}

		this._total = state.total;
		this.updateTotal(false); // Явное обновление суммы
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
