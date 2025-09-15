// Импорт типов, базовых классов и вспомогательных функций
import { IBasket } from '../../types';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

// Класс Basket, представляющий компонент корзины покупок
export class Basket extends Component<IBasket> {
	/**
	 * Контейнер для списка товаров
	 * @private
	 */
	private _listContainer: HTMLElement; // Переименовано для избежания конфликта
	/**
	 * Элемент отображения общей суммы заказа
	 * @private
	 */
	private total: HTMLElement; // Элемент для отображения общей суммы
	/**
	 * Кнопка оформления заказа
	 * @private
	 */
	private button: HTMLButtonElement; // Кнопка оформления заказа
	/**
	 * Получить корневой контейнер компонента
	 * @public
	 * @returns HTMLElement - корневой элемент компонента
	 */
	public getContainer(): HTMLElement {
		return this.container;
	}

	/**
	 * Конструктор класса
	 *
	 * @param container - корневой DOM-элемент компонента
	 * @param events - система событий приложения
	 *
	 * @remarks
	 * Инициализирует DOM-элементы и регистрирует обработчики событий
	 */
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация DOM-элементов
		this._listContainer = ensureElement<HTMLElement>(
			'.basket__list',
			container
		);
		this.total = ensureElement<HTMLElement>('.basket__price', container);
		this.button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		// Добавление обработчика события для кнопки оформления заказа
		this.button.addEventListener('click', () => this.events.emit('order:open'));
	}

	/**
	 * Установить список товаров в корзине
	 *
	 * @param items - массив готовых DOM-элементов товаров
	 *
	 * @remarks
	 * Очищает текущий список перед обновлением.
	 * При пустом списке отображает сообщение "Корзина пуста"
	 */
	set items(items: HTMLElement[]) {
		// Очистка списка перед обновлением
		this._listContainer.replaceChildren();

		if (items.length === 0) {
			// Если корзина пуста, отображаем сообщение
			this._listContainer.textContent = 'Корзина пуста';
			// Блокируем кнопку оформления заказа
			this.buttonDisabled = true;
		} else {
			// Добавляем все элементы списка
			this._listContainer.append(...items);
			// Разблокируем кнопку оформления заказа
			this.buttonDisabled = false;
		}
	}

	/**
	 * Альтернативный способ установки списка товаров
	 *
	 * @param items - массив готовых DOM-элементов товаров
	 *
	 * @remarks
	 * Делегирует работу методу items
	 */
	// set list(items: HTMLElement[]) {
	// 	this.items = items;
	// }

	/**
	 * Установить общую сумму заказа
	 *
	 * @param value - числовое значение суммы
	 *
	 * @remarks
	 * Форматирует сумму в строку с добавлением "синапсов"
	 */
	set totalAmount(value: number) {
		this.setText(this.total, `${value} синапсов`);
	}

	/**
	 * Установить состояние кнопки оформления заказа
	 *
	 * @param disabled - флаг блокировки кнопки
	 *
	 * @remarks
	 * Использует метод setDisabled для изменения состояния
	 */
	set buttonDisabled(disabled: boolean) {
		this.setDisabled(this.button, disabled);
	}

	// Метод для отрисовки корзины (теперь только обновляет данные)
	render(data: Partial<IBasket>): HTMLElement {
		// Обновление отображения общей суммы
		if (data.total !== undefined) {
			this.totalAmount = data.total;
		}

		// Блокировка/разблокировка кнопки оформления заказа
		// this.buttonDisabled = !data.items?.length;

		// Возврат контейнера компонента
		return this.container;
	}
}
