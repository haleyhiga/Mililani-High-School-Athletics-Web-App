const app = Vue.createApp({
    data() {
        return {
            products: [],
            cart: [],
            showCreateModal: false, // Toggles the create modal
            showEditModal: false,
            newProduct: {
                name: '',
                description: '',
                price: 0,
                quantity: 0
            },
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
        console.log("Vue instance created. Fetching products...");
        fetch("http://localhost:8080/products")
            .then(response => {
                console.log("Response received:", response); // Debug step
                return response.json();
            })
            .then(data => {
                console.log("Fetched products:", data.products); // Debug step
                this.products = data.products;
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    
        // Load cart from localStorage
        let storedCart = localStorage.getItem("cart");
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
        }
    },
    

    methods: {
        addToCart(product) {
            this.cart.push(product);
            localStorage.setItem("cart", JSON.stringify(this.cart));
            alert(`${product.name} added to cart`);
        },

        // Create a new product
        createProduct() {
            const formData = new FormData();
            formData.append("product_name", this.newProduct.name);
            formData.append("product_desc", this.newProduct.description);
            formData.append("price", this.newProduct.price);
            formData.append("quantity", this.newProduct.quantity);
            formData.append("image", this.newProduct.image); // Add image URL
        
            fetch("http://localhost:8080/products", {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (response.status === 201) {
                        alert("Product created successfully!");
                        this.fetchProducts(); // Refresh product list
                        this.showCreateModal = false; // Close modal
                        this.resetNewProduct(); // Reset form fields
                    } else {
                        alert("Error creating product");
                    }
                })
                .catch(error => {
                    console.error("Error creating product:", error);
                });
        },
            // Open the edit modal and populate the fields
            openEditModal(product) {
                this.editProduct = { 
                    id: product.product_id, 
                    name: product.product_name, 
                    description: product.product_desc, 
                    price: product.price, 
                    quantity: product.quantity, 
                    image: product.image 
                };
                this.showEditModal = true; // Show the modal
            },
            
        
            // Update the product in the database
            updateProduct() {
                const formData = new FormData();
                formData.append("product_name", this.editProduct.name);
                formData.append("product_desc", this.editProduct.description);
                formData.append("price", this.editProduct.price);
                formData.append("quantity", this.editProduct.quantity);
                formData.append("image", this.editProduct.image);
            
                fetch(`http://localhost:8080/products/${this.editProduct.id}`, {
                    method: "PUT",
                    body: formData
                })
                .then(response => {
                    if (response.status === 200) {
                        alert("Product updated successfully!");
                        this.fetchProducts(); // Refresh the product list
                        this.showEditModal = false; // Close the modal
                    } else {
                        alert("Error updating product");
                    }
                })
                .catch(error => {
                    console.error("Error updating product:", error);
                });
            },

            deleteProduct(product) {
                if (confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
                    fetch(`http://localhost:8080/products/${product.product_id}`, {
                        method: "DELETE",
                    })
                    .then(response => {
                        if (response.status === 200) {
                            alert(`Product "${product.product_name}" deleted successfully!`);
                            this.fetchProducts(); // Refresh the product list after deletion
                        } else {
                            alert(`Error deleting product: ${response.statusText}`);
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting product:", error);
                    });
                }
            },
            navigateToProductDetails(productId) {

                // Construct the URL dynamically
                let baseUrl = "http://localhost:8080/products/";
                let productUrl = baseUrl + productId;

                
                // Redirect to the product details page
                window.location.href = productUrl;
                console.log(window.location.href)
            },
            

        // Fetch updated products from the server
        fetchProducts() {
            fetch("http://localhost:8080/products")
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched products:", data.products); // Debugging step
                    this.products = data.products; // Assign the products array
                })
                .catch(error => {
                    console.error("Error fetching products:", error);
                });
        },
        
        

        // Reset new product form fields
        resetNewProduct() {
            this.newProduct = {
                name: '',
                description: '',
                price: 0,
                quantity: 0
            };
        }
    }
});

app.mount('#app');
