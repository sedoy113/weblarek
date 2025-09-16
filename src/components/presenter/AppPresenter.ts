// AppPresenter.ts
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
import { IBasket, FormErrors, IApiError, ICard, IOrder } from '../../types';
import { cloneTemplate, createElement } from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { createProductCard } from '../../utils/CardFactory';

export class AppPresenter {
	// Компоненты представления (View)
	private page: Page;
	private modal: Modal;
	private basket: Basket;
	private orderForm: OrderForm;
	private contactForm: ContactForm;
	private success: SuccessView;

	// Модели данных (Model)
	private productCatalog: ProductCatalogModel;
	private basketModel: BasketModel;
	private orderModel: OrderModel;

	constructor(
		private api: AppApi,
		// private productCatalog: ProductCatalogModel,
		private events: IEvents
	) {
		// Инициализация моделей внутри презентера
		this.productCatalog = new ProductCatalogModel(events);
		this.orderModel = new OrderModel(events);
		this.basketModel = new BasketModel(events);
		// Инициализация компонентов представления
		this.page = new Page(document.body, events);
		this.modal = new Modal(document.querySelector('#modal-container'), events);
		this.basket = new Basket(cloneTemplate('#basket'), events);
		this.orderForm = new OrderForm(cloneTemplate('#order'), events);
		this.contactForm = new ContactForm(cloneTemplate('#contacts'), events);
		this.success = new SuccessView(cloneTemplate('#success'), events);

		// Инициализация моделей
		this.orderModel = new OrderModel(events);
		this.basketModel = new BasketModel(events);
		// Передаем данные карточек в модель корзины
		this.basketModel.setCards(this.productCatalog.cards);
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
			const cards = await this.api.getCards();

			// Обновляем каталог с учетом текущего состояния корзины
			this.productCatalog.cards = cards.map((card) => ({
				...card,
				image: `${CDN_URL}${card.image}`,
				inBasket: this.basketModel.hasItem(card.id),
			}));
			this.basketModel.setCards(this.productCatalog.cards);
			this.renderCatalog();
		} catch (error) {
			const errorMessage = (error as Error).message || 'Неизвестная ошибка';
			this.modal.open(
				createElement('div', {
					textContent: `Ошибка загрузки товаров: ${errorMessage}`,
				})
			);
		}
	}

	/**
	 * Создает Map для быстрого доступа к данным карточек
	 */
	private getCardsMap(): Map<string, ICard> {
		return new Map(this.productCatalog.cards.map((card) => [card.id, card]));
	}

	/**
	 * Отрисовка каталога товаров на странице
	 */
	private renderCatalog(): void {
		const cardsArray = this.productCatalog.cards.map((card) =>
			createProductCard(card, this.events, '#card-catalog')
		);

		this.page.gallery = cardsArray.length
			? cardsArray
			: [createElement('div', { textContent: 'Товары не найдены' })];

		this.page.counter = this.basketModel.itemCount;
	}

	/**
	 * Обновляет состояние кнопки конкретной карточки товара
	 */
	private updateCardButton(id: string): void {
		const cardElement = this.productCatalog.getCard(id);
		if (!cardElement) return;
		this.renderCatalog();
	}

	/**
	 * Создает элементы списка корзины из данных модели
	 */
	private createBasketItems(itemIds: string[]): HTMLElement[] {
		if (!itemIds?.length) {
			return [];
		}

		return itemIds
			.map((id, index) => {
				const cardData = this.productCatalog.getCard(id);
				if (!cardData) return null;

				const cardElement = cloneTemplate('#card-basket');
				const itemView = new BasketItemView(
					cardElement,
					this.events,
					id,
					index + 1
				);
				itemView.render(cardData);
				return itemView.container;
			})
			.filter((item): item is HTMLElement => item !== null);
	}
	/**
	 * Настройка обработчиков событий для коммуникации между компонентами
	 */
	private setupEventListeners(): void {
		// Событие: выбор товара - открываем модальное окно с деталями
		this.events.on('product:select', ({ id }: { id: string }) => {
			const cardData = this.productCatalog.getCard(id);
			if (!cardData) return;

			const cardElement = cloneTemplate('#card-preview');
			const card = new ProductCard(cardElement, this.events); // Создаем экземпляр ProductCard
			this.modal.open(card.render(cardData));
		});

		// Событие: добавление товара в корзину
		this.events.on('basket:add', ({ id }: { id: string }) => {
			const cardData = this.productCatalog.getCard(id);
			if (cardData) {
				this.basketModel.addItem(cardData);
			}
		});

		// Событие: удаление товара из корзины
		this.events.on('basket:remove', ({ id }: { id: string }) => {
			this.basketModel.removeItem(id);
		});

		// Событие: изменение состояния корзины - обновляем отображение
		this.events.on('basket:changed', (data: IBasket) => {
			// Обновляем статус inBasket для всех карточек в каталоге
			this.page.counter = data.itemCount;

			// Обновляем представление корзины только если она открыта
			if (this.modal.isOpen()) {
				const basketElements = this.createBasketItems(data.itemIds);
				this.basket.items = basketElements;
				this.basket.render({ total: data.total });
			}

			// Обновляем состояние конкретных карточек, которые изменились
			// (это можно оптимизировать, если передавать id измененной карточки)
			// Пока обновляем все карточки, но это все равно лучше чем пересоздавать весь массив
			this.productCatalog.cards.forEach((card) => {
				const newInBasket = this.basketModel.hasItem(card.id);
				if (card.inBasket !== newInBasket) {
					card.inBasket = newInBasket;
					this.updateCardButton(card.id);
				}
			});
		});

		// Событие: открытие корзины
		this.events.on('basket:open', () => {
			this.basket.render({
				total: this.basketModel.total,
			});

			// Открываем модальное окно
			this.modal.open(this.basket.getContainer());
		});

		// Событие: открытие формы заказа
		this.events.on('order:open', () => {
			this.orderModel.clear();
			const order = this.orderModel.getOrder();
			this.orderModel.validateOrder();

			this.modal.open(
				this.orderForm.render({
					...order,
					valid: false,
					errors: '',
				})
			);
		});

		// Событие: выбор способа оплаты
		this.events.on('order:payment', (data: { payment: 'card' | 'cash' }) => {
			this.orderModel.setOrderField('payment', data.payment);
			this.orderForm.payment = data.payment;
		});

		// Событие: ввод адреса
		this.events.on('order:address', (data: { address: string }) => {
			this.orderModel.setOrderField('address', data.address);
			this.orderForm.address = data.address;
		});

		// Событие: валидация данных заказа
		this.events.on(
			'order:valid',
			(data: { isValid: boolean; errors: FormErrors }) => {
				this.orderForm.valid = data.isValid;
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
			this.orderModel.validateContacts();
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
			this.contactForm.email = data.email;
		});

		// Событие: ввод телефона
		this.events.on('contacts:phone', (data: { phone: string }) => {
			this.orderModel.setOrderField('phone', data.phone);
			this.contactForm.phone = data.phone;
		});

		// Событие: валидация данных контактов
		this.events.on(
			'contacts:valid',
			(data: { isValid: boolean; errors: FormErrors }) => {
				this.contactForm.valid = data.isValid;
				const emailError = data.errors.email || '';
				const phoneError = data.errors.phone || '';
				let errorMessage = '';

				if (emailError && phoneError) {
					errorMessage = `${emailError}; ${phoneError}`;
				} else if (emailError) {
					errorMessage = emailError;
				} else if (phoneError) {
					errorMessage = phoneError;
				}

				this.contactForm.errors = errorMessage;
			}
		);

		// Событие: успешное оформление заказа
		this.events.on('order:success', (data: { total: number }) => {
			this.modal.open(this.success.render({ total: data.total }));
			this.basketModel.clear();
			this.orderModel.clear();
		});

		// Событие: отправка формы контактов - финальное оформление заказа
		this.events.on('contacts:submit', async () => {
			try {
				const orderData = this.orderModel.getOrder();

				// Обновляем общую стоимость перед отправкой
				this.basketModel.setCards(this.productCatalog.cards);

				const fullOrder: IOrder = {
					...orderData,
					items: this.basketModel.itemIds,
					total: this.basketModel.total,
				};

				const response = await this.api.orderCards(fullOrder);
				this.events.emit('order:success', { total: response.total });

				this.basketModel.clear();
				this.orderModel.clear();
			} catch (error) {
				const errorMessage = (error as IApiError).error || 'Неизвестная ошибка';
				this.events.emit('order:error', { error: errorMessage });
			}
		});

		// Событие: закрытие окна успешного заказа
		this.events.on('success:close', () => {
			this.modal.close();
		});

		// Событие: блокировка/разблокировка страницы
		this.events.on('page:locked', (data: { locked: boolean }) => {
			this.page.locked = data.locked;
		});
	}
}
