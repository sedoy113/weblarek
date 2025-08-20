import { ICard } from '../../types';
import { IEvents } from '../base/events';

/**
 * Модель корзины для управления товарами
 * Отвечает за хранение состояния корзины и бизнес-логику работы с ней
 */
export class BasketModel {
	// Приватные поля для хранения состояния
	private _items: ICard[] = []; // Массив товаров в корзине
	private _total = 0; // Общая стоимость товаров в корзине
	private cards: ICard[]; // Ссылка на общий массив карточек товаров

	/**
	 * Конструктор модели корзины
	 * @param events - система событий для уведомления об изменениях
	 * @param cards - общий массив всех доступных товаров
	 */
	constructor(private events: IEvents, cards: ICard[]) {
		this.cards = cards;
	}

	/**
	 * Добавляет товар в корзину
	 * @param id - идентификатор добавляемого товара
	 */
	addItem(id: string): void {
		// Поиск товара в общем массиве по ID
		const source = this.cards.find((item) => item.id === id);
		if (!source) return; // Если товар не найден, выходим

		// Обновляем статус товара и добавляем в корзину
		source.inBasket = true;
		this._items.push(source);
		this.updateTotal(); // Пересчитываем общую стоимость

		// Уведомляем систему о изменении состояния корзины
		this.events.emit('basket:changed', {
			items: this._items,
			total: this._total,
		});
	}

	/**
	 * Удаляет товар из корзины
	 * @param id - идентификатор удаляемого товара
	 */
	removeItem(id: string): void {
		// Поиск индекса товара в корзине
		const index = this._items.findIndex((item) => item.id === id);
		if (index === -1) return; // Если товар не найден в корзине, выходим

		// Обновляем статус товара в общем массиве
		const source = this.cards.find((item) => item.id === id);
		if (source) {
			source.inBasket = false;
		}

		// Удаляем товар из корзины и пересчитываем стоимость
		this._items.splice(index, 1);
		this.updateTotal();

		// Уведомляем систему о изменении состояния корзины
		this.events.emit('basket:changed', {
			items: this._items,
			total: this._total,
		});
	}

	/**
	 * Очищает корзину полностью
	 * Сбрасывает все товары и общую стоимость
	 */
	clear(): void {
		// Сбрасываем статус всех товаров в корзине
		this._items.forEach((item) => (item.inBasket = false));

		// Очищаем массив товаров и сбрасываем стоимость
		this._items = [];
		this._total = 0;

		// Уведомляем систему о очистке корзины
		this.events.emit('basket:changed', {
			items: this._items,
			total: this._total,
		});
	}

	/**
	 * Геттер для получения товаров в корзине
	 * @returns Массив товаров ICard[]
	 */
	get items(): ICard[] {
		return this._items;
	}

	/**
	 * Геттер для получения общей стоимости
	 * @returns Общая стоимость товаров в корзине
	 */
	get total(): number {
		return this._total;
	}

	/**
	 * Геттер для получения идентификаторов товаров в корзине
	 * @returns Массив строк с ID товаров
	 */
	get itemIds(): string[] {
		return this._items.map((item) => item.id);
	}

	/**
	 * Приватный метод для пересчета общей стоимости товаров в корзине
	 * Использует reduce для суммирования цен всех товаров
	 */
	private updateTotal(): void {
		this._total = this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
	}
}
