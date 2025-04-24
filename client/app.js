const app = Vue.createApp({
    data() {
        return {
            products: [],
            cart: [],

            // for admin functionality
            isAdmin: false, 
            showCreateModal: false,
            showEditModal: false,

            // properties of products stored in db
            // fields for creating a new product
            newProduct: {
                name: '',
                description: '',
                price: 0,
                quantity: 0
            },
            // fields for editing products that already exist
            editProduct: {
                id: null,
                name: '',
                description: '',
                price: 0,
                quantity: 0,
                image: ''
            }
        };
    },

    created() {
        console.log("Getting products");
        this.fetchProducts(); // load the products from backend
        this.checkAdminSession(); // used to check if the admin is logged in
        // load the cart from localstorage if exists
        const storedCart = localStorage.getItem("cart");
        
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
        }
    },

    // used for real-time data updates such as the cart length, subtotal
    computed: {
        cartItemCount() {
            return this.cart.length; 
        },
        cartSubtotal() {
            return this.cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2); 
        }
    },
    methods: {
        // get all the products from the backend
        fetchProducts() {
            fetch("http://localhost:8080/products")
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched products:", data.products);
                    this.products = data.products;
                })
                .catch(error => console.error("Error fetching products:", error));
        },
   

        // redirect the user to the product detail page
        navigateToProductDetails(productId) {
            window.location.href = `http://localhost:8080/products/${productId}`;
        },
        // checkout process
        checkout() {
            const totalAmount = this.cart.reduce((total, item) => total + parseFloat(item.price), 0) * 100; // convert to cents
    
            fetch("http://localhost:8080/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ amount: totalAmount })
            })
            .then(response => response.json())
            .then(data => {
                if (data.clientSecret) {
                    // save the cart before payment
                    localStorage.setItem("cart", JSON.stringify(this.cart)); 
                    window.location.href = "checkout.html"; // redirect to checkout page
                } else { 
                    alert("Payment error. Try again.");
                }
            })
            .catch(error => console.error("Error creating payment intent:", error));
        },
    
        // checks if the admin session exists from bearer token
        checkAdminSession() {
            fetch("http://localhost:8080/sessions/admins", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("admin_session_id")
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log("Admin session check response:", data); 
                if (data.data && data.data.admin_id) {
                    this.isAdmin = true;  
                } else {
                    this.isAdmin = false;
                }
            })
            .catch(error => {
                console.error("Error checking admin session:", error);
                this.isAdmin = false; 
            });
        },
        
        
        // add product to cart
        addToCart(product) {
            const cartItem = {
                id: product.product_id, 
                product_name: product.product_name, 
                product_desc: product.product_desc, 
                price: product.price, 
                quantity: 1,
                image: product.image 
            };
            this.cart.push(cartItem);

              
            localStorage.setItem("cart", JSON.stringify(this.cart));
            alert(`${product.product_name} added to cart`);
        },

        // create a new product (ONLY IF ADMIN)
        createProduct() {
            const formData = new FormData();
            formData.append("product_name", this.newProduct.name);
            formData.append("product_desc", this.newProduct.description);
            formData.append("price", this.newProduct.price);
            formData.append("quantity", this.newProduct.quantity);
            formData.append("image", this.newProduct.image);
        
            fetch("http://localhost:8080/products", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("admin_session_id")
                }
            })
            .then(response => {
                if (response.status === 201) {
                    alert("Product created successfully!");
                    this.fetchProducts();
                    this.showCreateModal = false;
                    this.resetNewProduct();
                } else {
                    alert("Error creating product");
                }
            })
            .catch(error => console.error("Error creating product:", error));
        },

        // delete a product (ONLY IF ADMIN)
        deleteProduct(product) {
            if (!this.isAdmin) return;
            if (confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
                fetch(`http://localhost:8080/products/${product.product_id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("admin_session_id")
                    }
                })
                .then(response => {
                    if (response.status === 200) {
                        alert(`Product "${product.product_name}" deleted successfully!`);
                        this.fetchProducts();
                    } else {
                        alert("Error deleting product");
                    }
                })
                .catch(error => console.error("Error deleting product:", error));
            }
        },
        // logout admin
        logout() {
            console.log("clicked logout button");
            fetch("http://localhost:8080/sessions/logout", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("admin_session_id")
                }
            })
            .then(response => {
                if (response.status === 200) {
                    alert("Logged out successfully!");
                    localStorage.removeItem("admin_session_id"); 
                    this.isAdmin = false; 
                    this.$nextTick(() => {
                        window.location.reload();
                    });
                } else {
                    alert("Error logging out");
                }
            })
            .catch(error => {
                console.error("Error logging out:", error);
                this.isAdmin = false; 
            });
        },
        
        // open modal & populate the data for editing a product
        openEditModal(product) {
            console.log("Opening edit modal for:", product); 
            this.editProduct = { 
                id: product.product_id, 
                name: product.product_name, 
                description: product.product_desc, 
                price: product.price, 
                quantity: product.quantity, 
                image: product.image 
            };
            
            this.showEditModal = false; 
            this.$nextTick(() => {  
                this.showEditModal = true; 
            });
        },

        // remove product from cart
        removeFromCart(productId) {
            // find index of the product in the cart
            const index = this.cart.findIndex(item => item.id === productId);
            
            if (index !== -1) {
                // remove item
                this.cart.splice(index, 1);
                
                // update localStorage after removing the item
                localStorage.setItem("cart", JSON.stringify(this.cart));
    
                alert("Item removed from cart!");
            }
        },
        
        // update existing product
        updateProduct() {
            const formData = new FormData();
            formData.append("product_name", this.editProduct.name);
            formData.append("product_desc", this.editProduct.description);
            formData.append("price", this.editProduct.price);
            formData.append("quantity", this.editProduct.quantity);
            formData.append("image", this.editProduct.image);
    
            fetch(`http://localhost:8080/products/${this.editProduct.id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("admin_session_id")
                }
            })
            .then(response => {
                if (response.status === 200) {
                    alert("Product updated successfully!");
                    this.fetchProducts(); 
                    this.showEditModal = false; 
                } else {
                    alert("Error updating product");
                }
            })
            .catch(error => console.error("Error updating product:", error));
        }
        
        
    }
});

 

app.mount('#app');