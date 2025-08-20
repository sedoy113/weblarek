// Импорт типов, базовых классов и вспомогательных функций
import { IBasket } from '../../types';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { BasketItemView } from './BasketItemView';

// Класс Basket, представляющий компонент корзины покупок
export class Basket extends Component<IBasket> {
	// Элементы DOM, связанные с корзиной
	private list: HTMLElement; // Контейнер для списка товаров
	private total: HTMLElement; // Элемент для отображения общей суммы
	private button: HTMLButtonElement; // Кнопка оформления заказа

	// Конструктор класса
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация DOM-элементов
		this.list = ensureElement<HTMLElement>('.basket__list', container);
		this.total = ensureElement<HTMLElement>('.basket__price', container);
		this.button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		// Добавление обработчика события для кнопки оформления заказа
		// При клике эмитится событие 'order:open'
		this.button.addEventListener('click', () => this.events.emit('order:open'));
	}

	// Метод для отрисовки корзины с переданными данными
	render(data: Partial<IBasket>): HTMLElement {
		// Очистка списка товаров перед обновлением
		this.list.replaceChildren();

		// Проверка наличия товаров в корзине
		if (!data.items?.length) {
			// Если корзина пуста, отображаем сообщение
			this.list.textContent = 'Корзина пуста';
		} else {
			// Если есть товары, создаем и добавляем элементы для каждого товара
			data.items.forEach((item, index) => {
				// Клонирование шаблона элемента корзины
				const cardElement = cloneTemplate('#card-basket');

				// Создание представления элемента корзины
				const itemView = new BasketItemView(
					cardElement,
					this.events,
					item.id,
					index + 1 // Передача порядкового номера (начиная с 1)
				);

				// Отрисовка элемента корзины
				itemView.render(item);

				// Добавление элемента в список
				this.list.append(itemView.container);
			});
		}

		// Обновление отображения общей суммы
		this.setText(this.total, `${data.total} синапсов`);

		// Блокировка/разблокировка кнопки оформления заказа
		// Кнопка активна только если в корзине есть товары
		this.setDisabled(this.button, !data.items?.length);

		// Возврат контейнера компонента
		return this.container;
	}
}
