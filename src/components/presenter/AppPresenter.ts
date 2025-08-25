import { IEvents } from '../base/Events';
import { AppApi } from '../base/AppApi';
import { ProductCatalogModel } from '../model/ProductCatalogModel';
import { BasketModel } from '../model/BasketModel';
import { OrderModel } from '../model/OrderModel';
import { Page } from '../view/Page';
import { Modal } from '../view/ModalView';
import { ProductCard } from '../view/ProductCard';
import { Basket } from '../view/BasketView';
import { OrderForm } from '../view/OrderForm';
import { ContactForm } from '../view/ContactForm';
import { SuccessView } from '../view/SuccessView';
import { BasketItemView } from '../view/BasketItemView';
import { IBasket, FormErrors, IApiError, ICard, IOrder } from '../../types'; // Используем IProduct вместо IProductCard
import { cloneTemplate, createElement } from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { createProductCard } from '../../utils/CardFactory';

export class AppPresenter {
	// Компоненты представления (View)
	private page: Page; // Главная страница
	private modal: Modal; // Модальное окно
	private basket: Basket; // Корзина
	private orderForm: OrderForm; // Форма заказа (адрес и оплата)
	private contactForm: ContactForm; // Форма контактов (email и телефон)
	private success: SuccessView; // Сообщение об успешном заказе

	// Модели данных (Model)
	private basketModel: BasketModel; // Модель корзины
	private orderModel: OrderModel; // Модель заказа

	constructor(
		private api: AppApi, // API для работы с сервером
		private productCatalog: ProductCatalogModel, // Модель каталога товаров
		private events: IEvents // Система событий для коммуникации между компонентами
	) {
		// Инициализация компонентов представления
		this.page = new Page(document.body, events);
		this.modal = new Modal(document.querySelector('#modal-container'), events);
		this.basket = new Basket(cloneTemplate('#basket'), events);
		this.orderForm = new OrderForm(cloneTemplate('#order'), events);
		this.contactForm = new ContactForm(cloneTemplate('#contacts'), events);
		this.success = new SuccessView(cloneTemplate('#success'), events);

		// Инициализация модели заказа
		this.orderModel = new OrderModel(events);

		// Настройка обработчиков событий
		this.setupEventListeners();

		// Загрузка данных о товарах
		this.fetchCards();
	}

	/**
	 * Загрузка карточек товаров с сервера
	 */
	private async fetchCards(): Promise<void> {
		try {
			// Получение данных с сервера
			const cards = await this.api.getCards();

			// Обработка данных: добавление полного URL изображения и флага наличия в корзине
			this.productCatalog.cards = cards.map((card) => ({
				...card,
				image: `${CDN_URL}${card.image}`,
				inBasket: false,
			}));

			// Инициализация модели корзины после загрузки товаров
			this.basketModel = new BasketModel(
				this.events,
				this.productCatalog.cards
			);

			// Эмитируем событие о загрузке данных
			// this.events.emit('initialData:loaded');
		} catch (error) {
			// Обработка ошибки загрузки
			const errorMessage = (error as Error).message || 'Неизвестная ошибка';
			this.modal.open(
				createElement('div', {
					textContent: `Ошибка загрузки товаров: ${errorMessage}`,
				})
			);
		}
	}

	/**
	 * Отрисовка каталога товаров на странице
	 */
	private renderCatalog(): void {
		// Создание карточек товаров
		const cardsArray = this.productCatalog.cards.map((card) =>
			createProductCard(card, this.events, '#card-catalog')
		);

		// Установка карточек в галерею или сообщение об отсутствии товаров
		this.page.gallery = cardsArray.length
			? cardsArray
			: [createElement('div', { textContent: 'Товары не найдены' })];

		// Обновление счетчика товаров в корзине
		this.page.counter = this.basketModel?.items.length ?? 0;
	}

	/**
	 * Обновляет состояние кнопки конкретной карточки товара
	 */
	private updateCardButton(id: string): void {
		// const cardData = this.productCatalog.getCard(id);
		// if (!cardData) return;

		// Находим элемент карточки в DOM
		const cardElement = document.querySelector(`[data-id="${id}"]`);
		if (!cardElement) return;

		// Находим кнопку внутри карточки
		const button = cardElement.querySelector('.card__button');
		if (!button) return;

		// Обновляем текст и состояние кнопки
		const inBasket = this.basketModel.hasItem(id);
		button.textContent = inBasket ? 'Убрать из корзины' : 'В корзину';

		// Добавляем/убираем класс для стилизации
		if (inBasket) {
			button.classList.add('card__button_added');
		} else {
			button.classList.remove('card__button_added');
		}
	}

	/**
	 * Создает элементы списка корзины из данных модели
	 */
	private createBasketItems(items: ICard[]): HTMLElement[] {
		if (!items?.length) {
			return [];
		}

		return items.map((item, index) => {
			// Клонирование шаблона элемента корзины
			const cardElement = cloneTemplate('#card-basket');

			// Создание представления элемента корзины
			const itemView = new BasketItemView(
				cardElement,
				this.events,
				item.id,
				index + 1 // Передача порядкового номера
			);

			// Отрисовка элемента корзины
			itemView.render(item);

			// Возвращаем контейнер элемента
			return itemView.container;
		});
	}

	/**
	 * Настройка обработчиков событий для коммуникации между компонентами
	 */
	private setupEventListeners(): void {
		// Событие: данные загружены - отрисовываем каталог
		this.events.on('initialData:loaded', () => {
			this.renderCatalog();
		});

		// Событие: выбор товара - открываем модальное окно с деталями
		this.events.on('product:select', ({ id }: { id: string }) => {
			const cardData = this.productCatalog.getCard(id);
			if (!cardData) return;

			const cardElement = cloneTemplate('#card-preview');
			const card = new ProductCard(cardElement, this.events);
			this.modal.open(card.render(cardData));
		});

		// Событие: добавление товара в корзину
		this.events.on('basket:add', ({ id }: { id: string }) => {
			this.basketModel.addItem(id);
			this.modal.close(); // Закрываем модальное окно после добавления
		});

		// Событие: удаление товара из корзины
		this.events.on('basket:remove', ({ id }: { id: string }) => {
			this.basketModel.removeItem(id);
			this.modal.close();
		});

		// Событие: изменение состояния корзины - обновляем отображение
		this.events.on('basket:changed', (data: IBasket) => {
			// Создаем элементы списка корзины
			const basketItems = this.createBasketItems(data.items);

			// Устанавливаем готовые элементы в представление
			this.basket.items = basketItems;

			// Обновляем остальные данные корзины
			this.basket.render(data);

			// Обновляем счетчик товаров
			this.page.counter = data.items.length;

			// Обновляем состояние кнопок только для измененных товаров
			data.items.forEach((item) => this.updateCardButton(item.id));

			if (data.items.length === 0 && this.modal.close) {
				this.modal.close();
			}
			// Также обновляем кнопки товаров, которые были удалены из корзины
			// (это требует отслеживания предыдущего состояния, что сложнее)
		});

		// Событие: открытие корзины
		this.events.on('basket:open', () => {
			const basketData: IBasket = {
				items: this.basketModel.items,
				total: this.basketModel.total,
			};

			// Обновляем остальные данные
			this.basket.render(basketData);

			// Открываем модальное окно с корзиной
			this.modal.open(this.basket.getContainer());
		});

		// Событие: открытие формы заказа
		this.events.on('order:open', () => {
			this.orderModel.clear(); // Очищаем предыдущие данные заказа

			const order = this.orderModel.getOrder();

			this.orderModel.validateOrder(); // Валидация начальных данных

			// Открываем форму с начальными данными
			this.modal.open(
				this.orderForm.render({
					...order,
					valid: false, // Форма изначально не валидна
					errors: '', // Ошибок пока нет
				})
			);
		});

		// Событие: выбор способа оплаты
		this.events.on('order:payment', (data: { payment: 'card' | 'cash' }) => {
			this.orderModel.setOrderField('payment', data.payment);
			this.orderForm.payment = data.payment; // Обновляем отображение
		});

		// Событие: ввод адреса
		this.events.on('order:address', (data: { address: string }) => {
			this.orderModel.setOrderField('address', data.address);
			this.orderForm.address = data.address; // Обновляем отображение
		});

		// Событие: валидация данных заказа
		this.events.on(
			'order:valid',
			(data: { isValid: boolean; errors: FormErrors }) => {
				this.orderForm.valid = data.isValid; // Обновляем состояние кнопки

				// Формируем сообщение об ошибках
				const errorMessage = data.errors.address || data.errors.payment || '';
				this.orderForm.errors = errorMessage;
			}
		);

		// Событие: ошибка в данных заказа
		this.events.on('order:error', (data: { error: string }) => {
			this.orderForm.errors = data.error;
		});

		// Событие: отправка формы заказа - переход к форме контактов
		this.events.on('order:submit', () => {
			this.orderModel.validateContacts(); // Валидация контактов

			// Открываем форму контактов с текущими данными из модели заказа
			const orderData = this.orderModel.getOrder();
			this.modal.open(
				this.contactForm.render({
					...orderData,
					valid: false,
					errors: '',
				})
			);
		});

		// Событие: ввод email
		this.events.on('contacts:email', (data: { email: string }) => {
			this.orderModel.setOrderField('email', data.email);
			this.contactForm.email = data.email; // Обновляем отображение
		});

		// Событие: ввод телефона
		this.events.on('contacts:phone', (data: { phone: string }) => {
			this.orderModel.setOrderField('phone', data.phone);
			this.contactForm.phone = data.phone; // Обновляем отображение
		});

		// Событие: валидация данных контактов
		this.events.on(
			'contacts:valid',
			(data: { isValid: boolean; errors: FormErrors }) => {
				this.contactForm.valid = data.isValid; // Обновляем состояние кнопки

				// Формируем составное сообщение об ошибках
				const emailError = data.errors.email || '';
				const phoneError = data.errors.phone || '';

				let errorMessage = '';

				if (emailError && phoneError) {
					errorMessage = `${emailError}; ${phoneError}`;
				} else if (emailError) {
					errorMessage = emailError;
				} else if (phoneError) {
					errorMessage = phoneError;
				} else {
					errorMessage = '';
				}

				this.contactForm.errors = errorMessage;
			}
		);

		// Событие: успешное оформление заказа
		this.events.on('order:success', (data: { total: number }) => {
			this.basketModel.clear(); // Очищаем корзину
			this.modal.open(this.success.render({ total: data.total })); // Показываем успех
		});

		// Событие: отправка формы контактов - финальное оформление заказа
		this.events.on('contacts:submit', async () => {
			try {
				// Получаем данные заказа из модели
				const orderData = this.orderModel.getOrder();

				// Формируем полный объект заказа, добавляя данные из корзины
				const fullOrder: IOrder = {
					...orderData,
					items: this.basketModel.itemIds,
					total: this.basketModel.total,
				};

				// Отправляем заказ на сервер через API
				const response = await this.api.orderCards(fullOrder);

				// Отправляем событие об успешном создании заказа
				this.events.emit('order:success', { total: response.total });

				// Очищаем корзину и данные заказа
				this.basketModel.clear();
				this.orderModel.clear();
			} catch (error) {
				// Обрабатываем ошибку и отправляем соответствующее событие
				const errorMessage = (error as IApiError).error || 'Неизвестная ошибка';
				this.events.emit('order:error', { error: errorMessage });
			}
		});

		// Событие: закрытие окна успешного заказа
		this.events.on('success:close', () => {
			this.modal.close();
		});

		// Событие: блокировка/разблокировка страницы (при открытии модальных окон)
		this.events.on('page:locked', (data: { locked: boolean }) => {
			this.page.locked = data.locked;
		});
	}
}
