import { Component } from '../base/Component';
import { IEvents } from '../base/eventst';
import { ensureElement } from '../../utils/utils';

/**
 * Класс представления успешного завершения заказа
 * Отображает информацию о списании синапсов и предоставляет кнопку закрытия
 * @extends Component<{ total: number }> Расширяет базовый компонент с типом данных { total: number }
 */
export class SuccessView extends Component<{ total: number }> {
	/**
	 * Элемент для отображения описания с информацией о списании
	 * @type {HTMLElement}
	 * @private
	 */
	private description: HTMLElement;

	/**
	 * Кнопка закрытия окна успешного завершения заказа
	 * @type {HTMLButtonElement}
	 * @private
	 */
	private closeButton: HTMLButtonElement;

	/**
	 * Создает экземпляр представления успешного завершения заказа
	 * @param {HTMLElement} container Родительский контейнер для компонента
	 * @param {IEvents} events Объект для работы с событиями приложения
	 */
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация элементов DOM
		this.description = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			container
		);

		// Добавление обработчика события на кнопку закрытия
		this.closeButton.addEventListener('click', () =>
			this.events.emit('success:close')
		);
	}

	/**
	 * Обновляет и отображает компонент с переданными данными
	 * @param {Partial<{ total: number }>} data Данные для отображения, включая общую сумму списания
	 * @returns {HTMLElement} Обновленный DOM-элемент компонента
	 */
	render(data: Partial<{ total: number }>): HTMLElement {
		// Установка текста описания с информацией о списании синапсов
		this.setText(this.description, `Списано ${data.total} синапсов`);
		return this.container;
	}
}
