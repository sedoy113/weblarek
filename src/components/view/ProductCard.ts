import { CardView } from './CardView';
import { ICard } from '../../types';
import { IEvents } from '../base/events';
/**
 * Компонент карточки товара, расширяющий базовый класс CardView.
 * Отвечает за отображение информации о товаре и взаимодействие с ним.
 */
export class ProductCard extends CardView {
	/** @private Идентификатор карточки */
	private _cardId: string;

	/** @private Элемент для отображения описания */
	private _description?: HTMLElement;

	/** @private Кнопка взаимодействия с товаром */
	private _button?: HTMLButtonElement;

	/** @private Статус наличия товара в корзине */
	private _inBasket = false;

	/**
	 * Конструктор компонента
	 * @param container DOM-контейнер для монтирования карточки
	 * @param events Объект событий для взаимодействия с другими компонентами
	 */
	constructor(container: HTMLElement, private events: IEvents) {
		super(container);

		// Инициализация элементов интерфейса
		this._description = container.querySelector('.card__text');
		this._button = container.querySelector('.card__button');

		// Обработчик клика по карточке
		container.addEventListener('click', () => {
			/**
			 * Событие выбора товара
			 * @event product:select
			 * @property {string} id - Идентификатор выбранного товара
			 */
			this.events.emit('product:select', { id: this.id });
		});

		// Обработчик клика по кнопке
		if (this._button) {
			this._button.addEventListener('click', (evt) => {
				evt.stopPropagation();

				/**
				 * Событие добавления/удаления товара из корзины
				 * @event basket:add|card:remove
				 * @property {string} id - Идентификатор товара
				 */
				this.events.emit(this._inBasket ? 'card:remove' : 'basket:add', {
					id: this.id,
				});
			});
		}
	}

	/**
	 * Установка идентификатора карточки
	 * @param value Новый идентификатор
	 */
	set id(value: string) {
		this._cardId = value;
	}

	/**
	 * Получение идентификатора карточки
	 * @returns Текущий идентификатор
	 */
	get id() {
		return this._cardId;
	}

	/**
	 * Установка статуса наличия товара в корзине
	 * @param value Новый статус
	 */
	set inBasket(value: boolean) {
		this._inBasket = value;

		// Обновление текста на кнопке
		if (this._button) {
			this.setText(this._button, value ? 'Убрать' : 'В корзину');
		}
	}

	/**
	 * Установка цены товара
	 * @param price Новая цена
	 */
	set price(price: number) {
		super.price = price;

		// Управление видимостью кнопки
		if (this._button) {
			this._button.style.display = price === null ? 'none' : '';
		}
	}

	/**
	 * Установка описания товара
	 * @param text Новое описание
	 */
	set description(text: string) {
		if (this._description) {
			this.setText(this._description, text);
		}
	}

	/**
	 * Метод рендеринга карточки товара
	 * @param cardData Данные для обновления карточки
	 * @returns DOM-контейнер с обновленной карточкой
	 */
	render(cardData: Partial<ICard>): HTMLElement {
		// Обновление свойств карточки
		if (cardData.id) this.id = cardData.id;
		if (cardData.title) this.title = cardData.title;
		if (cardData.category) this.category = cardData.category;
		if (cardData.price !== undefined) this.price = cardData.price;
		if (cardData.image) this.image = cardData.image;
		if (cardData.description) this.description = cardData.description;
		if (cardData.inBasket !== undefined) this.inBasket = cardData.inBasket;

		return this.container;
	}
}
