// Импорт типов карточки и данных каталога, а также интерфейса событий
import { ICard, ICardsData } from '../../types';
import { IEvents } from '../base/Events';

// Класс модели каталога продуктов, реализующий интерфейс ICardsData
export class ProductCatalogModel implements ICardsData {
	// Защищенное поле для хранения массива продуктов
	protected _products: ICard[];
	// Поле для хранения экземпляра менеджера событий
	protected events: IEvents;

	// Конструктор класса, принимающий менеджер событий
	constructor(events: IEvents) {
		this.events = events;
		// Инициализация пустого массива продуктов
		this._products = [];
	}

	// Геттер для получения массива карточек продуктов
	get cards() {
		return this._products;
	}

	// Сеттер для установки массива карточек продуктов
	set cards(products: ICard[]) {
		// Присваивание переданного массива продуктов
		this._products = products;
		// Генерация события о загрузке начальных данных
		this.events.emit('initialData:loaded');
		// Генерация события для отображения продуктов
		this.events.emit('products:show');
	}

	// Метод для поиска карточки по идентификатору
	getCard(cardId: string): ICard | null {
		// Поиск карточки в массиве по ID, возврат null если не найдено
		return this._products.find((item) => item.id === cardId) || null;
	}
}
