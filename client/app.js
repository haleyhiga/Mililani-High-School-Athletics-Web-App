const app = Vue.createApp({
    data() {
        return {
            products: [
                { id: 1, name: 'Shirt', description: 'insert desc here', price: 20, image: 'shirt.jpg' },
                { id: 2, name: 'Hat', description: 'insert desc here', price: 15, image: 'hat.jpg' }
            ],
            cart: [] 
        };
    },

    created() {
        let storedCart = localStorage.getItem("cart");
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
        }
    },

    methods: {
        addToCart(product) {
            this.cart.push(product);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            alert(`${product.name} added to cart`);
        },

        removeFromCart(productId) {
            let updatedCart = [];
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id !== productId) {
                    updatedCart.push(this.cart[i]);
                }
            }
            this.cart = updatedCart;
            localStorage.setItem("cart", JSON.stringify(this.cart));
        }
    }
});

app.mount('#app');
