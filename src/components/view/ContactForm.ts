// Импорт необходимых модулей и типов
import { Form } from './FormView'; // Базовый класс формы
import { IOrderForm } from '../../types'; // Интерфейс данных формы заказа
import { IEvents } from '../base/events'; // Интерфейс системы событий
import { ensureElement } from '../../utils/utils'; // Утилита для гарантированного получения элемента

// Класс формы контактов, наследуется от базовой формы
export class ContactForm extends Form<IOrderForm> {
	// Поля для элементов ввода телефона и email
	protected phoneInput: HTMLInputElement;
	protected emailInput: HTMLInputElement;

	// Конструктор класса
	constructor(container: HTMLFormElement, events: IEvents) {
		// Вызов конструктора родительского класса
		super(container, events);

		// Инициализация поля ввода телефона с гарантированным получением элемента
		this.phoneInput = ensureElement<HTMLInputElement>(
			'input[name=phone]', // CSS-селектор для поиска элемента
			this.container // Контейнер для поиска
		);

		// Инициализация поля ввода email с гарантированным получением элемента
		this.emailInput = ensureElement<HTMLInputElement>(
			'input[name=email]', // CSS-селектор для поиска элемента
			this.container // Контейнер для поиска
		);

		// Добавление обработчика события ввода для поля email
		this.emailInput.addEventListener('input', () => {
			// Генерация события при изменении email с передачей текущего значения
			this.events.emit('contacts:email', { email: this.emailInput.value });
		});

		// Добавление обработчика события ввода для поля телефона
		this.phoneInput.addEventListener('input', () => {
			// Генерация события при изменении телефона с передачей текущего значения
			this.events.emit('contacts:phone', { phone: this.phoneInput.value });
		});
	}

	// Сеттер для установки значения поля телефона
	set phone(value: string) {
		this.phoneInput.value = value;
	}

	// Сеттер для установки значения поля email
	set email(value: string) {
		this.emailInput.value = value;
	}
}
