import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
/**
 * Компонент модального окна
 *
 * @class Modal
 * @extends {Component<unknown>}
 */
export class Modal extends Component<unknown> {
	/**
	 * Элемент контента модального окна
	 * @private
	 * @type {HTMLElement}
	 */
	private content: HTMLElement;

	/**
	 * Кнопка закрытия модального окна
	 * @private
	 * @type {HTMLButtonElement}
	 */
	private closeButton: HTMLButtonElement;

	/**
	 * Creates an instance of Modal.
	 * Инициализирует модальное окно и устанавливает обработчики событий
	 *
	 * @param {HTMLElement} container - DOM-контейнер модального окна
	 * @param {IEvents} events - Система событий приложения
	 */
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация элементов интерфейса
		this.content = ensureElement<HTMLElement>('.modal__content', container);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);

		// Настройка обработчиков событий
		this.closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this.content.addEventListener('click', (event) => event.stopPropagation());

		// Привязка метода для обработки нажатия клавиш
		this.handleEsc = this.handleEsc.bind(this);
	}

	/**
	 * Открывает модальное окно с указанным содержимым
	 *
	 * @param {HTMLElement} content - Элемент, который будет отображаться внутри модального окна
	 * @returns {void}
	 */
	open(content: HTMLElement): void {
		if (!content) return;

		// Очистка и установка нового контента
		this.content.replaceChildren(content);
		this.container.classList.add('modal_active');

		// Регистрация глобального обработчика клавиш
		document.addEventListener('keyup', this.handleEsc);

		// Вызов событий
		this.events.emit('modal:open');
		this.events.emit('page:locked', { locked: true });
	}

	/**
	 * Закрывает модальное окно
	 *
	 * @returns {void}
	 */
	close(): void {
		// Очистка контента и визуальных эффектов
		this.content.innerHTML = '';
		this.container.classList.remove('modal_active');

		// Удаление глобального обработчика клавиш
		document.removeEventListener('keyup', this.handleEsc);

		// Вызов событий
		this.events.emit('modal:close');
		this.events.emit('page:locked', { locked: false });
	}

	/**
	 * Обрабатывает нажатие клавиш, особенно клавиши Escape
	 *
	 * @param {KeyboardEvent} evt - Объект события клавиатуры
	 * @returns {void}
	 */
	handleEsc(evt: KeyboardEvent) {
		if (evt.key === 'Escape') {
			this.close();
		}
	}
}
