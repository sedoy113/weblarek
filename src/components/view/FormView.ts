// Импорт базового компонента и интерфейса событий
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

// Интерфейс для состояния формы
interface IFormState {
	valid: boolean; // Флаг валидности формы
	errors: string; // Текст ошибок формы
}

// Универсальный класс Form для работы с формами
// T - тип данных, которые содержит форма
export class Form<T> extends Component<IFormState> {
	// Кнопка отправки формы
	protected _submit: HTMLButtonElement;
	// Элемент для отображения ошибок
	protected _errors: HTMLElement;

	// Конструктор класса
	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		// Находим кнопку отправки формы
		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		// Находим элемент для отображения ошибок
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		// Обработчик изменения полей ввода
		this.container.addEventListener('input', (evt: Event) => {
			const target = evt.target as HTMLInputElement;
			const field = target.name as keyof T; // Получаем имя поля как ключ типа T
			const value = target.value; // Получаем значение поля
			this.onInputChange(field, value); // Вызываем метод обработки изменения
		});

		// Обработчик отправки формы
		this.container.addEventListener('submit', (evt: Event) => {
			evt.preventDefault(); // Предотвращаем стандартное поведение
			this.events.emit(`${this.container.name}:submit`); // Генерируем событие отправки
		});
	}

	// Метод обработки изменения поля ввода
	protected onInputChange(field: keyof T, value: string) {
		// Генерируем событие изменения конкретного поля
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field, // Поле, которое изменилось
			value, // Новое значение поля
		});
	}

	// Сеттер для установки валидности формы
	set valid(value: boolean) {
		// Блокируем/разблокируем кнопку отправки в зависимости от валидности
		this._submit.disabled = !value;
	}

	// Сеттер для установки текста ошибок
	set errors(value: string) {
		// Устанавливаем текст ошибок в соответствующий элемент
		this.setText(this._errors, value);
	}

	// Метод рендеринга формы
	render(state: Partial<T> & IFormState) {
		// Разделяем состояние на валидность/ошибки и остальные поля
		const { valid, errors, ...inputs } = state;
		// Рендерим базовые свойства (valid, errors)
		super.render({ valid, errors });
		// Копируем остальные поля ввода в текущий объект
		Object.assign(this, inputs);
		return this.container;
	}
}
